import { Request, Response } from "express";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import RequestModel from "../models/Request.js";
import { calculateCost } from "../utils/costCalculator.js";
import { OpenAIChatCompletionRequest } from "../models/openAIRequest.js";
import { generateEmbedding } from "../utils/embeddingGenerator.js";
import CacheEntry from "../models/CacheEntry.js";
import { getDB } from "../db/mongoose.js";

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
    const _mongoDbContext = getDB();
    const cacheEntryEntity = _mongoDbContext.collection('cacheEntry');
    // Search for similar prompts in the database
    // Filter results after the query
    const pipeline =[
      {
        '$vectorSearch': {
          'queryVector': promptEmbedding, 
          'path': 'promptEmbedding', 
          'numCandidates': 1000, 
          'limit': 1, 
          'index': 'prompt_embedding_vector_index'
        }
      }, {
        '$project': {
          '_id': 1, 
          'response': 1, 
          'score': {
            '$meta': 'vectorSearchScore'
          }
        }
      }, {
        '$match': {
          'score': {
            '$gte': 0.9
          }
        }
      }
    ];
    const similarRequest = await cacheEntryEntity.aggregate(pipeline).toArray();

    // If similar prompt found, return cached response
    if (similarRequest.length > 0) {
      res.status(200).json(similarRequest[0].response);
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

    // Store the response in the cache collection
    await CacheEntry.create({
      _id: uuidv4(),
      projectId,
      prompt,
      promptEmbedding,
      response: responseData,
      createdAt: new Date(),
    });

    res.status(openaiResponse.status).json(responseData);
  } catch (error) {
    console.error("Proxy request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
