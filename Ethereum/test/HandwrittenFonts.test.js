const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());

const compiledContract = require("../build/HandwrittenFonts.json");

let instance;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  instance = await new web3.eth.Contract(compiledContract.abi)
    .deploy({ data: compiledContract.evm.bytecode.object })
    .send({ from: accounts[0], gas: "1400000" });
});

describe("Handwritten Fonts", () => {
  it("deploys an instance", () => {
    assert.ok(instance.options.address);
  });

  it("stores encrypted data", async () => {
    const testMessageHash = padToBytes32(
      "0x1234567890123456789012345678901234567890123456789012345678901234"
    );
    const testEncryptedKey = padToBytes32(
      "0x123abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabc"
    );
    const testEncryptedCid = padToBytes32(
      "0x456abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabc"
    );

    await instance.methods
      .storeEncryptedData(testMessageHash, testEncryptedKey, testEncryptedCid)
      .send({ from: accounts[0], gas: "1400000" });

    const storedData = await instance.methods.getEncryptedData(testMessageHash).call();

    assert.strictEqual(storedData.encryptedSymmetricKey, testEncryptedKey);
    assert.strictEqual(storedData.encryptedCid, testEncryptedCid);
  });

  it("updates password status", async () => {
    const testAccount = accounts[0];
    const testStatus = true;

    await instance.methods
      .updatePasswordStatus(testStatus)
      .send({ from: testAccount, gas: "1400000" });

    const storedStatus = await instance.methods.checkPasswordStatus().call({ from: testAccount });

    assert.strictEqual(storedStatus, testStatus);
  });

  it("stores public key", async () => {
    const testAddress = accounts[2];
    const testPublicKey = padToBytes32(
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef"
    );

    await instance.methods.storePublicKey(testAddress, testPublicKey).send({ from: accounts[0] });

    const storedPublicKey = await instance.methods.addressToPublicKey(testAddress).call();

    assert.strictEqual(storedPublicKey, testPublicKey);
  });
});

function padToBytes32(hexString) {
  while (hexString.length < 66) {
    // 2 characters for '0x' and 64 characters for 32 bytes
    hexString += "0";
  }
  return hexString;
}
