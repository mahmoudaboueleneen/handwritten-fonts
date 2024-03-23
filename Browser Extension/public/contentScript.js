/* eslint-disable no-undef */
function injectScript(file_path) {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", file_path);
  (document.head || document.documentElement).appendChild(script);
}

injectScript(chrome.runtime.getURL("assets/injectedScript-CVX7b_kC.js"));

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

    // Set up a one-time listener for the response from the injected script
    const responseListener = (event) => {
      if (event.source !== window) return;

      if (event.data.type && event.data.type.endsWith("_RESULT")) {
        sendResponse({ result: event.data.result });
        window.removeEventListener("message", responseListener);
      } else if (event.data.type && event.data.type.endsWith("_ERROR")) {
        sendResponse({ error: event.data.error });
        window.removeEventListener("message", responseListener);
      }
    };

    window.addEventListener("message", responseListener);

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});
