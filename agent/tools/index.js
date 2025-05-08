import { getPersonBySkillTool } from "./get-person-by-skill.js";
import { getWeatherTool } from "./get-weather.js";
import { sendEmailTool } from "./send-email.js";

export const tools = [getWeatherTool, getPersonBySkillTool, sendEmailTool];
