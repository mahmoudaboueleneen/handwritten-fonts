import web3Instance from "./Web3Instance";
import compiledContract from "./build/HandwrittenFonts.json";

function getContractInstance(address) {
  return new web3Instance.eth.Contract(compiledContract.abi, address);
}

export { getContractInstance };
