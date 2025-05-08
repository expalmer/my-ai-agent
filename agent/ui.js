import yoctoSpinner from "yocto-spinner";

export const showLoader = (text) => {
  const spinner = yoctoSpinner({
    text,
    color: "cyan",
  }).start();

  return spinner;
};

const roleColors = {
  user: "\x1b[36m", // cyan
  assistant: "\x1b[32m", // green
};

const reset = "\x1b[0m";

export const logMessage = (message) => {
  const role = message.role;
  const color = roleColors[role] || "\x1b[37m";

  if (role === "tool") {
    return;
  }

  // Log user messages (only have content)
  if (role === "user") {
    console.log(`\n${color}[USER]${reset}`);
    console.log(`${message.content}\n`);
    return;
  }

  // Log assistant messages
  if (role === "assistant") {
    // // If has tool_calls, log function name
    if (message?.tool_calls?.length) {
      console.log(`\n${color}[ASSISTANT]${reset}`);
      console.log(message);
      message?.tool_calls.forEach((tool) => {
        console.log(tool);
      });
    }

    // If has content, log it
    if (message.content) {
      console.log(`\n${color}[ASSISTANT]${reset}`);
      console.log(`${message.content}\n`);
    }
  }
};
