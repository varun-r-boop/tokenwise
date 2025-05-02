import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import RequestModel from '../models/Request';
import { calculateCost } from '../utils/costCalculator';

interface ProxyRequest {
  openaiEndpoint: string;
  customerEndpoint: string;
  openaiPayload: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    [key: string]: any;
  };
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

export const handleProxyRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { openaiEndpoint, customerEndpoint, openaiPayload, projectId } = req.body as ProxyRequest;
    
    // Validate required fields
    if (!openaiEndpoint || !openaiPayload) {
      res.status(400).json({ error: 'openaiEndpoint and openaiPayload are required' });
      return;
    }

    const startTime = Date.now();
    
    // Construct headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiPayload.headers?.Authorization}`
    };

    // Add organization ID if provided
    //if (openaiPayload.organizationId) {
      headers['OpenAI-Organization'] ="";
    //}

    // Make the request to OpenAI
    const openaiResponse = await fetch(`https://api.openai.com${openaiEndpoint}`, {
      method: openaiPayload.method || 'POST',
      headers,
      body: openaiPayload.body ? JSON.stringify(openaiPayload.body) : undefined
    });

    const responseData = await openaiResponse.json() as OpenAIResponse;
    const durationMs = Date.now() - startTime;

    // Extract model from the request
    const model = openaiPayload.body?.model || 'unknown';

    // Extract prompt from messages or use prompt directly
    const prompt = openaiPayload.body?.messages?.[0]?.content || 
                  openaiPayload.body?.prompt || 
                  '';

    // Extract token usage
    const usage = responseData.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const promptTokens = usage.prompt_tokens;
    const responseTokens = usage.completion_tokens;
    const totalTokens = usage.total_tokens;

    // Calculate cost
    const costUSD = calculateCost(model, totalTokens);

    // Log request to MongoDB
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
      status: openaiResponse.status
    });

    // Return OpenAI response to client
    res.status(openaiResponse.status).json(responseData);
  } catch (error) {
    console.error('Proxy request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 