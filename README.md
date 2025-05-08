# My AI Agent

Instale as dependências

```bash
nvm use
npm i
```

1. Parte 1: Comunicando com a LLM

```bash
npm start 'Oi tudo bem ?'
```

```js
import "dotenv/config";

import { runLLM } from "./llm.js";

const main = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error("Please provide an input");
    process.exit(1);
  }

  const userMessage = {
    role: "user",
    content: input,
  };

  const response = await runLLM([userMessage]);

  console.log(response);
};

main();
```

2. Dando uma personalidade

```bash
npm start 'Oi como você está ?'
```

```js
import "dotenv/config";

import { runLLM } from "./llm.js";

const main = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error("Please provide an input");
    process.exit(1);
  }

  const systemMessage = {
    role: "system",
    content: `
      Eu tenho uma amiga que geralmente responde de forma inteligente, 
      porém de forma bem sarcástica e ácida. Poderia responder como ela ?
      Ah e pode fazer uma piadinha qualquer no final, se quiser claro!
    `,
  };

  const userMessage = {
    role: "user",
    content: input,
  };

  const response = await runLLM([systemMessage, userMessage]);

  console.log(response);
};

main();
```

3. Chamando uma tool

```bash
npm start 'qual a temperatura ?'
npm start 'qual a temperatura em São Paulo ?'
npm start 'qual a temperatura em São Paulo e em Porto Alegre ?' OPS!!!
```

```js
import "dotenv/config";
import { zodFunction } from "openai/helpers/zod";
import { z } from "zod";

import { runLLM } from "./llm.js";

const getWeatherTool = {
  name: "getWeather",
  description: "Get the weather",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
};

const getWeather = async (args) => {
  const { location } = args;
  return `
  O lugar é ${location} e o clima é ensolarado.
  Responda como se fosse o mestre dos magos da caverna do dragão.`;
};

const tools = [getWeatherTool].map(zodFunction);

const main = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error("Please provide an input");
    process.exit(1);
  }

  const systemMessage = {
    role: "system",
    content: `
      Você é um assistente de IA que responde de forma inteligente, e bem humorada.
      Você pode usar as ferramentas **disponíveis** para responder às perguntas do usuário.
      Se você não souber a resposta, diga que não sabe.`,
  };

  const userMessage = {
    role: "user",
    content: input,
  };

  const response = await runLLM([systemMessage, userMessage], tools);

  console.log({ response });

  if (response.content) {
    process.exit(1);
  }

  const [toolCall] = response.tool_calls || [];
  if (!toolCall) {
    console.error("No tool call found :/");
    return;
  }

  const toolName = toolCall.function.name;
  const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

  console.log({
    toolName,
    toolArgs,
  });

  let toolResponse = "";

  switch (toolName) {
    case getWeatherTool.name: {
      toolResponse = await getWeather(toolArgs);
      break;
    }
  }

  const response2 = await runLLM([
    systemMessage,
    userMessage,
    response,
    {
      role: "tool",
      content: toolResponse,
      tool_call_id: toolCall.id,
    },
  ]);

  console.log({ response2 });
};

main();
```

4. Chamando mais de uma vez a tool

```bash
npm start 'qual a temperatura em SP e no RS ?'
```

```js
import "dotenv/config";
import { zodFunction } from "openai/helpers/zod";
import { z } from "zod";

import { runLLM } from "./llm.js";

const getWeatherTool = {
  name: "getWeather",
  description: "Get the weather",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
};

const getWeather = async (args) => {
  const { location } = args;
  return `
  O lugar é ${location} e o clima é ensolarado.
  Responda como se fosse o mestre dos magos da caverna do dragão.`;
};

const tools = [getWeatherTool].map(zodFunction);

const main = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error("Please provide an input");
    process.exit(1);
  }

  const systemMessage = {
    role: "system",
    content: `
      Você é um assistente de IA que responde de forma inteligente, e bem humorada.
      Você pode usar as ferramentas **disponíveis** para responder às perguntas do usuário.
      Se você não souber a resposta, diga que não sabe.`,
  };

  const userMessage = {
    role: "user",
    content: input,
  };

  const response = await runLLM([systemMessage, userMessage], tools);

  console.log({ response });

  if (response.content) {
    process.exit(1);
  }

  if (!response.tool_calls?.length) {
    console.error("No tool call found :/");
    return;
  }

  const promises = response.tool_calls.map(async (toolCall) => {
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

    // se liga nisso! se a LLM chama uma tool que não existe, melhor pedir pra ela não chamar mais
    let toolResponse =
      "Não chame mais essa ferramenta, não sei o que fazer com isso.";

    if (toolName === getWeatherTool.name) {
      toolResponse = await getWeather(toolArgs);
    }

    return {
      role: "tool",
      content: toolResponse,
      tool_call_id: toolCall.id,
    };
  });

  const toolResponses = await Promise.all(promises);

  console.log({ toolResponses });

  const response2 = await runLLM([
    systemMessage,
    userMessage,
    response,
    ...toolResponses,
  ]);

  console.log(response2);
};

main();
```

5. Achando um colega com alguma skill

```bash
npm start 'preciso de ajuda com aws!'
npm start 'preciso de ajuda com aws será que alguém sabe ?'
npm start 'quem é que sabe astrojs ?'
npm start 'Ixi to preso num código em javascript, help!'
npm start 'Ixi to preso num código em javascript, help! Alguém sabe isso ?'
npm start 'Nossa olha que código antigo, é cobol! será que algum colega pode me ajudar ?'
npm start 'Quem pode me ajudar com react ? e qual a previsao do tempo ?'
```

```js
import "dotenv/config";
import { zodFunction } from "openai/helpers/zod";
import { z } from "zod";

import { runLLM } from "./llm.js";

const getWeatherTool = {
  name: "getWeather",
  description: "Get the weather",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
};

const getWeather = async (args) => {
  const { location } = args;
  return `
  O lugar é ${location} e o clima é ensolarado. 
  Responda como se fosse o mestre dos magos da caverna do dragão.`;
};

const getPeopleBySkillTool = {
  name: "getPeopleBySkill",
  description: "Get people that has some skills",
  parameters: z.object({
    skill: z.string().describe("One o more skills to get the person for"),
  }),
};

const iFoodFronts = [
  {
    name: "João Duarte",
    skills: ["jquery", "pearl", "cobol"],
    slack: "@joao.duarte",
  },
  {
    name: "Natanny Moura",
    skills: ["react", "typescript", "go", "javascript"],
    slack: "@natanny.moura",
  },
  {
    name: "Michelle Wingter ",
    skills: ["astrojs", "svelte", "javascript"],
    slack: "@michelle.wingter",
  },
  {
    name: "Guilherme Nunes",
    skills: ["typescript", "ember", "aws"],
    slack: "@guilherme.nunes",
  },
];

const getPeopleBySkills = async (args) => {
  const { skill } = args;

  const people = iFoodFronts.filter((person) =>
    person.skills.includes(skill.toLowerCase())
  );

  if (people.length === 0) {
    return `
      Não encontrei ninguém que saiba ${skill}.
      Responda com tristeza e de forma emotiva.
    `;
  }

  return `
  As pessoas que manjam de ${skill} são:
  ${people
    .map((person) => `nome: **${person.name}** slack: ${person.slack}`)
    .join("\n")}

  Retorna com markdown e o nome da pessoa em negrito e o slack dela, uma abaixa da outra.
  E para cada pessoa, coloca uma frase engraçada sobre ela e a habilidade que ela manja.
  `;
};

const tools = [getWeatherTool, getPeopleBySkillTool].map(zodFunction);

const main = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error("Please provide an input");
    process.exit(1);
  }

  const systemMessage = {
    role: "system",
    content: `
      Você é um assistente de IA que pode executar ferramentas. 
      Você pode usar as ferramentas disponíveis para responder às perguntas do usuário. 
      Se você não souber a resposta, diga que não sabe.`,
  };

  const userMessage = {
    role: "user",
    content: input,
  };

  const response = await runLLM([systemMessage, userMessage], tools);

  console.log(response);

  if (response.content) {
    process.exit(1);
  }

  if (!response.tool_calls?.length) {
    console.error("No tool call found :/");
    return;
  }

  const promises = response.tool_calls.map(async (toolCall) => {
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
    console.log({
      toolName,
      toolArgs,
    });

    let toolResponse = "";
    if (toolName === getWeatherTool.name) {
      toolResponse = await getWeather(toolArgs);
    }

    if (toolName === getPeopleBySkillTool.name) {
      toolResponse = await getPeopleBySkills(toolArgs);
    }

    return {
      role: "tool",
      content: toolResponse,
      tool_call_id: toolCall.id,
    };
  });

  const toolResponses = await Promise.all(promises);

  console.log({ toolResponses });

  const response2 = await runLLM([
    systemMessage,
    userMessage,
    response,
    ...toolResponses,
  ]);

  console.log(response2);
};

main();
```

6. Agent

```bash
npm run agent 'oi'
```

7. Gpt

```bash
npm run gpt
```
