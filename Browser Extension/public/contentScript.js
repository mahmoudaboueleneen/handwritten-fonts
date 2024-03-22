/* eslint-disable no-undef */
function injectScript(file_path) {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", file_path);
  (document.head || document.documentElement).appendChild(script);
}

injectScript(chrome.runtime.getURL("assets/injectedScript-CEBrU7ou.js"));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method) {
    let messageType;
    if (request.method === "request") {
      messageType = "CALL_ETHEREUM_METHOD";
    } else {
      messageType = request.options.type === "call" ? "CALL_CONTRACT_METHOD" : "SEND_CONTRACT_METHOD";
    }

    window.postMessage(
      {
        type: messageType,
        method: request.method,
        options: request.options
      },
      "*"
    );

    window.addEventListener("message", (event) => {
      if (event.source !== window) return; // We only accept messages from ourselves

      if (event.data.type && event.data.type.endsWith("_RESULT")) {
        sendResponse({ result: event.data.result });
      } else if (event.data.type && event.data.type.endsWith("_ERROR")) {
        sendResponse({ error: event.data.error });
      }
    });

    return true; // Will respond asynchronously.
  }
});
