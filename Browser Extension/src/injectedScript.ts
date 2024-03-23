/* eslint-disable no-unexpected-multiline */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3 } from "web3";

import compiledContract from "../../Ethereum/build/HandwrittenFonts.json";
import { config } from "./config/config";

if (typeof window.ethereum === "undefined") {
  throw new Error("window.ethereum is undefined, make sure you have MetaMask installed");
}

const web3Instance = new Web3(window.ethereum);
const contractInstance = new web3Instance.eth.Contract(compiledContract.abi, config.deployedContractAddress);

window.addEventListener("message", (event) => {
  if (event.source !== window) return; // We only accept messages from ourselves

  if (event.data.type) {
    if (event.data.type === "CALL_ETHEREUM_METHOD") {
      callEthereumMethod(event.data.method, ...event.data.options.methodArgs);
    } else if (event.data.type === "CALL_CONTRACT_METHOD") {
      callContractMethod(event.data.method, "call", event.data.options.methodArgs, event.data.options.callArgs);
    } else if (event.data.type === "SEND_CONTRACT_METHOD") {
      callContractMethod(event.data.method, "send", event.data.options.methodArgs, event.data.options.sendArgs);
    }
  }
});

function callEthereumMethod(method: string, ...args: any[]) {
  (window.ethereum as any)
    [method](...args)
    .then((result: any) => {
      console.log("Ethereum method result:", result);
      window.postMessage(
        {
          type: "ETHEREUM_METHOD_RESULT",
          result
        },
        "*"
      );
    })
    .catch((error: any) => {
      console.error("Ethereum method error:", error);
      window.postMessage(
        {
          type: "ETHEREUM_METHOD_ERROR",
          error: error.message
        },
        "*"
      );
    });
}

function callContractMethod(method: string, type: "call" | "send", methodArgs: any[], callArgs: any[]) {
  if (!contractInstance) {
    throw new Error("Contract instance is not initialized");
  }

  (contractInstance.methods[method](...methodArgs) as any)
    [type](...callArgs)
    .then((result: any) => {
      console.log("Contract method result:", result);
      window.postMessage(
        {
          type: type === "call" ? "CONTRACT_CALL_RESULT" : "CONTRACT_SEND_RESULT",
          result
        },
        "*"
      );
    })
    .catch((error: any) => {
      console.error("Contract method error:", error);
      window.postMessage(
        {
          type: type === "call" ? "CONTRACT_CALL_ERROR" : "CONTRACT_SEND_ERROR",
          error: error.message
        },
        "*"
      );
    });
}
