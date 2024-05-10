/* eslint-disable no-undef */
function injectScript(file_path) {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", file_path);
  (document.head || document.documentElement).appendChild(script);
}

/**
 * @summary This is a workaround for the issue of the content script not being able to access the same 
            JavaScript variables as those available in the actual active webpage. This is because the content
            script runs in a separate context from the webpage. The workaround is to inject a script into the
            webpage that can access the webpage's JavaScript variables and then communicate with the content
            script This injected script is the one that actually interacts with the Ethereum provider and
            then sends the results back to the content script.

            Also, any time the injected script is changed, its filename should be manually updated in the following line.
            You must build the extension, see what the new filename is, and then update the following line, then rebuild again.

            For more information about the communication between the extension and metamask, see the docs.
 */
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
      checkNodeAndDescendants(node);
    });
  });
});

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

// Check all existing nodes when the page loads
checkNodeAndDescendants(document.body);

// Then start the MutationObserver to detect changes
observer.observe(document.body, { childList: true, subtree: true });
