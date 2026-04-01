import Anthropic from "@anthropic-ai/sdk";
import type { BuiltPrompt } from "./prompt-builder.js";

export interface GenerateOptions {
  model: string;
  maxTokens: number;
  stream?: boolean;
  onStream?: (text: string) => void;
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export async function generateNarrative(
  prompt: BuiltPrompt,
  options: GenerateOptions
): Promise<string> {
  const anthropic = getClient();

  if (options.stream && options.onStream) {
    return streamNarrative(anthropic, prompt, options);
  }

  const response = await anthropic.messages.create({
    model: options.model,
    max_tokens: options.maxTokens,
    system: prompt.system,
    messages: [{ role: "user", content: prompt.user }],
  });

  const textBlocks = response.content.filter((b) => b.type === "text");
  return textBlocks.map((b) => b.text).join("");
}

async function streamNarrative(
  anthropic: Anthropic,
  prompt: BuiltPrompt,
  options: GenerateOptions
): Promise<string> {
  const stream = anthropic.messages.stream({
    model: options.model,
    max_tokens: options.maxTokens,
    system: prompt.system,
    messages: [{ role: "user", content: prompt.user }],
  });

  const parts: string[] = [];

  stream.on("text", (text) => {
    parts.push(text);
    options.onStream?.(text);
  });

  await stream.finalMessage();

  return parts.join("");
}
