import { runLLM } from "./llm.js";
import {
  addMessages,
  getMessages,
  resetMessages,
  saveToolResponse,
} from "./memory.js";
import { runTool } from "./tool-runner.js";
import { logMessage, showLoader } from "./ui.js";

export const runAgent = async (message, tools) => {
  await resetMessages();
  await addMessages([
    {
      role: "system",
      content: `
      Você é um assistente de IA que pode executar ferramentas. 
      Você pode usar as ferramentas disponíveis para responder às perguntas do usuário. 
      Se você não souber a resposta, diga que não sabe.`,
    },
    {
      role: "user",
      content: message,
    },
  ]);

  const spinner = showLoader("🤔");

  let i = 4;
  while (true) {
    // vc não quer gastar todos seus tokens de uma vez
    if (i-- === 0) {
      spinner.stop();
      console.log("OPS");
      return;
    }

    const history = await getMessages();

    const response = await runLLM(history, tools);

    await addMessages([response]);

    if (response.content) {
      spinner.stop();
      logMessage(response);
      return getMessages();
    }

    if (response.tool_calls) {
      const promises = response.tool_calls.map(async (toolCall) => {
        spinner.text = `executing: ${toolCall.function.name}`;

        const toolResponse = await runTool(toolCall, message);

        await saveToolResponse(toolCall.id, toolResponse);

        spinner.text = `done: ${toolCall.function.name}`;
      });

      await Promise.all(promises);
    }
  }
};
