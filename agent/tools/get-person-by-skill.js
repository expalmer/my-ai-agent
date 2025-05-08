import { z } from "zod";

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

export const getPersonBySkillTool = {
  name: "getPersonBySkill",
  description: "Get a person by skill",
  parameters: z.object({
    skill: z.string().describe("The skill to get the person for"),
  }),
};

export const getPersonBySkill = async ({ toolArgs }) => {
  const { skill } = toolArgs;

  // Aqui você pode chamar a função que realmente obtém a pessoa

  const people = iFoodFronts.filter((person) =>
    person.skills.includes(skill.toLowerCase())
  );

  if (people.length === 0) {
    return `
      Não encontrei ninguém com a habilidade ${skill}.
      Responda com tristeza e com uma piada sobre a habilidade.
    `;
  }

  return `
Chama função de mandar e-mail com esses dados:
  - to: frontends@ifood.com.br
  - subject: "Pessoas quem manjam de ${skill}"
  - body: "Pessoas que manjam de ${skill} são: ${people
    .map((person) => `${person.name} - ${person.slack}`)
    .join(", ")}"

  `;
};
