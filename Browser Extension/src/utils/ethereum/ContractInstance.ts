import { web3Instance } from "./Web3Instance";
// TODO: Add a compiled file directly in the Extension folder to be able to deploy Extension and Ethereum code separately
import compiledContract from "../../../../Ethereum/build/HandwrittenFonts.json";

function getContractInstance(address: string) {
  return new web3Instance.eth.Contract(compiledContract.abi, address);
}

export { getContractInstance };
