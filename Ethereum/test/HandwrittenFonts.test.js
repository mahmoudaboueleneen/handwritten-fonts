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
    const testMessageHash = "hello world";
    const testEncryptedSymmetricKey = "fawodkwaodawdwmdiwkamdikedmeadiea";
    const testEncryptedCidOfEncryptedFontFile =
      "bafybeigaatp2gbrqht5rgypzsblf2lsy6sxaa47mxga7qtmu4a7buptqve";
    const testEncryptedFilenameOfEncryptedFontFile = "encryptedFontFile.pem";

    await instance.methods
      .storeEncryptedData(
        testMessageHash,
        testEncryptedSymmetricKey,
        testEncryptedCidOfEncryptedFontFile,
        testEncryptedFilenameOfEncryptedFontFile
      )
      .send({ from: accounts[0], gas: "1400000" });

    const storedData = await instance.methods.messageHashToEncryptedData(testMessageHash).call();

    assert.strictEqual(storedData.encryptedSymmetricKey, testEncryptedSymmetricKey);
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
    const testPublicKey = `-----BEGIN PUBLIC KEY-----
    MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBnI22QE17p9Y0rL5dkJj7y
    UC1Y12NPsFwQMfTLCPMZOjh+dk6h8gGf9jGEw4tft/BevkJUmybBoAgZD8FI/VjD
    MzwgLv/tnkH+drDtguiIGk9TR/uozlQW0+zKud2qTHYoEAuVh67st57KhOtj9/5O
    70DkqADJ8yPCY5nnVkOhsm9I121d1hNkmM/CzOGv1QwDdipyPvJLifzEWPzNIJaS
    yf5lQefIjvLBp8aEeZU6w8dL9s/cIb9zA1LBLQVl2OeqJv7c5h7WUHx9mr3WgIK/
    E1gp+56ytmIJt+UXcvUOAyshtQ0gN6+zCCBz89lDVYHt9xZ4VVwLI3ykawxiIQB5
    AgMBAAE=
    -----END PUBLIC KEY-----`;

    await instance.methods
      .storePublicKey(testPublicKey)
      .send({ from: testAddress, gas: "1400000" });

    const storedPublicKey = await instance.methods.addressToPublicKey(testAddress).call();

    assert.strictEqual(storedPublicKey, testPublicKey);
  });
});
