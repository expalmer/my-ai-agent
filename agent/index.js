import "dotenv/config";
import { runAgent } from "./agent.js";
import { tools } from "./tools/index.js";

const input = process.argv[2];
if (!input) {
  console.error("Please provide an input");
  process.exit(1);
}

await runAgent(input, tools);
