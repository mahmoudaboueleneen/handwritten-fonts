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

  if (event.data.type && event.data.type === "CALL_ETHEREUM_METHOD") {
    if (event.data.method === "request") {
      callEthereumMethod(event.data.method, ...event.data.args);
    } else {
      callContractMethod(event.data.method, event.data.type, ...event.data.args);
    }
  }
});

function callEthereumMethod(method: string, ...args: any[]) {
  (window.ethereum as any)
    [method](...args)
    .then((result: any) => {
      window.postMessage(
        {
          type: "ETHEREUM_METHOD_RESULT",
          result
        },
        "*"
      );
    })
    .catch((error: any) => {
      window.postMessage(
        {
          type: "ETHEREUM_METHOD_ERROR",
          error: error.message
        },
        "*"
      );
    });
}

function callContractMethod(method: string, type: string, ...args: any[]) {
  if (!contractInstance) {
    throw new Error("Contract instance is not initialized");
  }

  (contractInstance.methods[method](...args) as any)
    [type]()
    .then((result: any) => {
      window.postMessage(
        {
          type: "ETHEREUM_METHOD_RESULT",
          result
        },
        "*"
      );
    })
    .catch((error: any) => {
      window.postMessage(
        {
          type: "ETHEREUM_METHOD_ERROR",
          error: error.message
        },
        "*"
      );
    });
}
