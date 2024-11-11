import { log } from "./logger.js";

export function promptUser(tab, promptType) {
  return new Promise((resolve) => {
      try {
        chrome.tabs.sendMessage(tab.id, {action: promptType}, (response) => {
          if (chrome.runtime.lastError) {
            resolve({status: "error", message: chrome.runtime.lastError.message});
          } else {
            resolve(response);
          }
        });
      }
      catch (error) {
        resolve({status: "error", message: error.message});
      }
  });
}

export function promptUserFallback(promptType) {
  return new Promise((resolve) => {
    chrome.windows.getLastFocused({populate: true}, (window) => {
      if (window && window.tabs) {
        const activeTab = window.tabs.find(tab => tab.active);
        if (activeTab) {
          chrome.tabs.sendMessage(activeTab.id, {action: promptType}, (response) => {
            if (chrome.runtime.lastError) {
              resolve({status: "error", message: chrome.runtime.lastError.message});
            } else {
              resolve(response);
            }
          });
        } else {
          resolve({status: "error", message: "No active tab found in the last focused window"});
        }
      } else {
        resolve({status: "error", message: "No window or tabs found"});
      }
    });
  });
}

// Event Listeners
export async function tryPrompt(tab, promptType) {
  let result = await promptUser(tab, promptType);
  if (result.status === "error") {
    result = await promptUserFallback(promptType);
  }
  switch (result.status) {
    case "success":
      log.log("User input:", result.userInput);
      // Process the user input as needed
      break;
    case "cancelled":
      log.log("User cancelled the prompt");
      // Handle cancellation
      break;
    case "error":
      log.error("Error occurred:", result.message);
      // Handle error
      break;
  }
  return result.userInput;
}