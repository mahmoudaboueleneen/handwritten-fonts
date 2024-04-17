/* eslint-disable no-undef */
function injectScript(file_path) {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", file_path);
  (document.head || document.documentElement).appendChild(script);
}

injectScript(chrome.runtime.getURL("assets/injectedScript-CVX7b_kC.js"));

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
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
        // Convert BigInt values (non-serializable) to strings
        const result = JSON.parse(
          JSON.stringify(event.data.result, (_, v) => (typeof v === "bigint" ? v.toString() : v))
        );
        console.log("event.data.result:", result);
        sendResponse({ result: result });
        window.removeEventListener("message", responseListener);
      } else if (event.data.type && event.data.type.endsWith("_ERROR")) {
        console.log("event.data.error:", event.data.error);
        sendResponse({ error: event.data.error });
        window.removeEventListener("message", responseListener);
      }
    };

    window.addEventListener("message", responseListener);

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      // Recursively check all descendants of the added node
      const checkNodeAndDescendants = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const messageRegex = /(.*)##\|\|tag:HandwrittenFontsExt<1\.0\.0>\|\|uuid:([a-f0-9-]{36})\|\|##/;
          const match = node.textContent.match(messageRegex);
          if (match) {
            console.log("Message detected:", match[1]);
            let parentElement = node.parentElement;
            parentElement.setAttribute("data-uuid", match[2]);
            parentElement.setAttribute("data-original-content", node.textContent);
            parentElement.textContent = match[1];
            chrome.runtime.sendMessage({ type: "DETECTED_MESSAGE", message: match[1], uuid: match[2] });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.childNodes.forEach(checkNodeAndDescendants);
        }
      };

      checkNodeAndDescendants(node);
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
