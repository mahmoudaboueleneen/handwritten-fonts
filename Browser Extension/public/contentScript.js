/* eslint-disable no-undef */
function injectScript(file_path) {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", file_path);
  (document.head || document.documentElement).appendChild(script);
}

injectScript(chrome.runtime.getURL("assets/injectedScript-CWgGWTOi.js"));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method) {
    window.postMessage(
      {
        type: "CALL_ETHEREUM_METHOD",
        method: request.method,
        args: request.args,
        callType: request.callType
      },
      "*"
    );

    window.addEventListener("message", (event) => {
      if (event.source !== window) return; // We only accept messages from ourselves

      if (event.data.type && event.data.type === "ETHEREUM_METHOD_RESULT") {
        sendResponse({ result: event.data.result });
      } else if (event.data.type && event.data.type === "ETHEREUM_METHOD_ERROR") {
        sendResponse({ error: event.data.error });
      }
    });

    return true; // Will respond asynchronously.
  }
});
