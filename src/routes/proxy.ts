import { Request, Response } from "express";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import RequestModel from "../models/Request";
import { calculateCost } from "../utils/costCalculator";
import { OpenAIChatCompletionRequest } from "../models/openAIRequest";

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
    const prompt =
      openaiPayload.messages?.map((m) => m.content).join("\n") || "";

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

    await RequestModel.create({
      _id: uuidv4(),
      projectId,
      customerEndpoint,
      openaiEndpoint,
      model,
      prompt,
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
