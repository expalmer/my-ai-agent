import { z } from "zod";

export const getWeatherTool = {
  name: "getWeather",
  description: "Get the weather",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
};

export const getWeather = async ({ toolArgs }) => {
  const { location } = toolArgs;
  // Aqui você pode chamar a função que realmente obtém o clima
  return `
  O lugar é ${location} e o clima é ensolarado. 
  Responda como se fosse o mestre dos magos da caverna do dragão.`;
};
