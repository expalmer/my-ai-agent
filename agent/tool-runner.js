import {
  getPersonBySkill,
  getPersonBySkillTool,
} from "./tools/get-person-by-skill.js";
import { getWeather, getWeatherTool } from "./tools/get-weather.js";
import { sendEmail, sendEmailTool } from "./tools/send-email.js";

export const runTool = async (toolCall, userMessage) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments || "{}"),
  };

  switch (toolCall.function.name) {
    case getWeatherTool.name:
      return getWeather(input);

    case getPersonBySkillTool.name:
      return getPersonBySkill(input);

    case sendEmailTool.name:
      return sendEmail(input);

    default:
      return `Never run this tool: ${toolCall.function.name} again, or else!`;
  }
};
