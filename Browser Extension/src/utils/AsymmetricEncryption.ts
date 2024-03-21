import * as crypto from "crypto-browserify";

export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048
  });

  return {
    publicKey: publicKey.export({ type: "pkcs1", format: "pem" }),
    privateKey: privateKey.export({ type: "pkcs1", format: "pem" })
  };
}

export function encryptMessage(publicKey: string, message: string): string {
  const bufferMessage = Buffer.from(message);
  const encryptedMessage = crypto.publicEncrypt(publicKey, bufferMessage);

  return encryptedMessage.toString("base64");
}

export function decryptMessage(privateKey: string, encryptedMessage: string): string {
  const bufferEncryptedMessage = Buffer.from(encryptedMessage, "base64");
  const decryptedMessage = crypto.privateDecrypt(privateKey, bufferEncryptedMessage);

  return decryptedMessage.toString();
}
