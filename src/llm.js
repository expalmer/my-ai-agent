import OpenAI from "openai";

const openai = new OpenAI();

export const runLLM = async (messages, tools = []) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages,
    tools,
  });

  return response.choices[0].message;
};
