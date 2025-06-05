import { Request, Response } from "express";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import RequestModel from "../models/Request.js";
import { calculateCost } from "../utils/costCalculator.js";
import { OpenAIChatCompletionRequest } from "../models/openAIRequest.js";
import { generateEmbedding } from "../utils/embeddingGenerator.js";

interface ProxyRequest {
  openaiEndpoint: string;
  customerEndpoint: string;
  openaiPayload: OpenAIChatCompletionRequest;
  projectId: string;
}

interface OpenAIResponse {
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  [key: string]: any;
}

export const handleProxyRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { openaiEndpoint, customerEndpoint, openaiPayload, projectId } =
      req.body as ProxyRequest;

    if (!openaiEndpoint || !openaiPayload || !projectId) {
      res.status(400).json({
        error:
          "Missing required fields: openaiEndpoint, openaiPayload, projectId",
      });
      return;
    }

    const prompt = openaiPayload.messages?.map((m) => m.content).join("\n") || "";
    
    // Generate embedding for the prompt
    const promptEmbedding = await generateEmbedding(prompt);

    // Search for similar prompts in the database
    const similarRequest = await RequestModel.findOne({
      projectId,
      $vectorSearch: {
        queryVector: promptEmbedding,
        path: "promptEmbedding",
        numCandidates: 1,
        limit: 1,
        index: "prompt_embedding_vector_index",
        score: { $meta: "vectorSearchScore" }
      }
    }).where("vectorSearchScore").gt(0.85); //Need to revisit the Similarity threshold

    // If similar prompt found, return cached response
    if (similarRequest) {
      res.status(200).json(similarRequest.response);
      return;
    }

    const startTime = Date.now();

    const openaiResponse = await fetch(`${openaiEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers["authorization"] || "",
        "OpenAI-Organization": req.headers["openai-organization"] || "",
      },
      body: JSON.stringify(openaiPayload),
    });

    const responseData = (await openaiResponse.json()) as OpenAIResponse;
    const durationMs = Date.now() - startTime;

    const model = openaiPayload.model || "unknown";

    const usage = responseData.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    const {
      prompt_tokens: promptTokens,
      completion_tokens: responseTokens,
      total_tokens: totalTokens,
    } = usage;

    const costUSD = calculateCost(model, totalTokens);

    // Store the new request with its embedding
    await RequestModel.create({
      _id: uuidv4(),
      projectId,
      customerEndpoint,
      openaiEndpoint,
      model,
      prompt,
      promptEmbedding,
      response: responseData,
      promptTokens,
      responseTokens,
      totalTokens,
      costUSD,
      durationMs,
      status: openaiResponse.status,
      createdAt: new Date(),
    });

    res.status(openaiResponse.status).json(responseData);
  } catch (error) {
    console.error("Proxy request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
