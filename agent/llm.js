import OpenAI from "openai";
import { zodFunction } from "openai/helpers/zod";

const openai = new OpenAI();

export const runLLM = async (messages, tools = []) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages,
    tools: tools.map(zodFunction),
  });

  return response.choices[0].message;
};

export const runLLMImageGeneration = async (prompt) => {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
};
