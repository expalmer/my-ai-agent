import { JSONFilePreset } from "lowdb/node";
import { uid } from "uid";

const defaultData = {
  messages: [],
};

export const getDb = async () => {
  const db = await JSONFilePreset("db.json", defaultData);
  return db;
};

export const resetMessages = async () => {
  const db = await getDb();
  db.data.messages = [];
  await db.write();
};

const addMetadata = (message) => {
  return {
    ...message,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
};

const removeMetadata = (message) => {
  const { id, createdAt, ...rest } = message;
  return rest;
};

export const addMessages = async (messages) => {
  const db = await getDb();
  db.data.messages.push(...messages.map(addMetadata));
  await db.write();
};

export const getMessages = async () => {
  const db = await getDb();
  return db.data.messages.map(removeMetadata);
};

export const saveToolResponse = async (toolCallId, toolResponse) => {
  return addMessages([
    {
      role: "tool",
      content: toolResponse,
      tool_call_id: toolCallId,
    },
  ]);
};
