import { Web3 } from "web3";

window.ethereum.request({ method: "eth_requestAccounts" });
const web3Instance = new Web3(window.ethereum);

export { web3Instance };