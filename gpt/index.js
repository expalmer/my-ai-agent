import "dotenv/config";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { runLLM } from "./llm.js";

const rl = readline.createInterface({
  input,
  output,
});

const chat = () => {
  const history = [
    {
      role: "system",
      content: `
      Você é um assistente de IA útil. Responda às perguntas do usuário da melhor maneira possível.
      `,
    },
  ];

  const start = () => {
    rl.question("You ", async (userInput) => {
      if (userInput.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      console.log(history);

      const userMessage = {
        role: "user",
        content: userInput,
      };

      const response = await runLLM([...history, userMessage]);

      history.push(userMessage, response);

      console.log(`\n\nAI: ${response.content}\n\n`);

      start();
    });
  };

  start();
};

chat();
