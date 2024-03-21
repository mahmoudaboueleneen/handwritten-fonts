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
    const testMessageHash = "";
    const testCidOfEncryptedSymmetricKey =
      "bafybeigaatp2gbrqht5rgypzsblf2lsy6sxaa47mxga7qtmu4a7buptqve";
    const testFilenameOfEncryptedSymmetricKey = "encryptedSymmetricKey.pem";
    const testEncryptedCidOfEncryptedFontFile =
      "bafybeigaatp2gbrqht5rgypzsblf2lsy6sxaa47mxga7qtmu4a7buptqve";
    const testEncryptedFilenameOfEncryptedFontFile = "encryptedFontFile.pem";

    await instance.methods
      .storeEncryptedData(
        testMessageHash,
        testCidOfEncryptedSymmetricKey,
        testFilenameOfEncryptedSymmetricKey,
        testEncryptedCidOfEncryptedFontFile,
        testEncryptedFilenameOfEncryptedFontFile
      )
      .send({ from: accounts[0], gas: "1400000" });

    const storedData = await instance.methods.messageHashToEncryptedData(testMessageHash).call();

    assert.strictEqual(storedData.cidOfEncryptedSymmetricKey, testCidOfEncryptedSymmetricKey);
    assert.strictEqual(
      storedData.filenameOfEncryptedSymmetricKey,
      testFilenameOfEncryptedSymmetricKey
    );
    assert.strictEqual(
      storedData.encryptedCidOfEncryptedFontFile,
      testEncryptedCidOfEncryptedFontFile
    );
    assert.strictEqual(
      storedData.encryptedFilenameOfEncryptedFontFile,
      testEncryptedFilenameOfEncryptedFontFile
    );
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
    const testAddress = accounts[0];
    const testPublicKeyCid = "bafybeigaatp2gbrqht5rgypzsblf2lsy6sxaa47mxga7qtmu4a7buptqve";
    const testPublicKeyFilename = "public.pem";

    await instance.methods
      .storePublicKeyData(testPublicKeyCid, testPublicKeyFilename)
      .send({ from: testAddress, gas: "1400000" });

    const storedPublicKeyData = await instance.methods.addressToPublicKeyData(testAddress).call();

    assert.strictEqual(storedPublicKeyData.publicKeyCid, testPublicKeyCid);
    assert.strictEqual(storedPublicKeyData.publicKeyFilename, testPublicKeyFilename);
  });
});
