const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const contractPath = path.resolve(__dirname, "contracts", "HandwrittenFonts.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "HandwrittenFonts.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts["HandwrittenFonts.sol"];

fs.ensureDirSync(buildPath);

for (let contract in output) {
  fs.outputJsonSync(path.resolve(buildPath, contract.replace(":", "") + ".json"), output[contract]);
}
