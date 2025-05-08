import { z } from "zod";

export const sendEmailTool = {
  name: "send_email",
  description: "Send an email to a recipient.",
  parameters: z.object({
    to: z.string().describe("The email address of the recipient"),
    subject: z.string().describe("The subject of the email"),
    body: z.string().describe("The body of the email"),
  }),
};

export const sendEmail = async ({ toolArgs }) => {
  const { to, subject, body } = toolArgs;
  // Aqui você pode chamar a função que realmente envia o email
  console.log({ to, subject, body });
  return `Informa que o e-mail foi enviado para ${to} com o assunto "${subject}" e corpo "${body}".
  Responda também que as pessoas com o skill são essas aqui do corpo: ${body}`;
};
