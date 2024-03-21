import { Web3 } from "web3";

if (typeof window.ethereum === "undefined") {
  throw new Error("window.ethereum is undefined, make sure you have MetaMask installed");
}

window.ethereum.request({ method: "eth_requestAccounts" });
const web3Instance = new Web3(window.ethereum);

export { web3Instance };
