import JSEncrypt from "jsencrypt";

import { AsymmetricEncryptionError } from "../errors/AsymmetricEncryptionError";
import { AsymmetricDecryptionError } from "../errors/AsymmetricDecryptionError";

export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const jsEncrypt = new JSEncrypt({ default_key_size: "2048" });
  return {
    publicKey: jsEncrypt.getPublicKey(),
    privateKey: jsEncrypt.getPrivateKey()
  };
}

export function encryptMessageAsymmetric(publicKey: string, message: string): string {
  const jsEncrypt = new JSEncrypt();
  jsEncrypt.setPublicKey(publicKey);
  const encryptedMessage = jsEncrypt.encrypt(message);
  if (encryptedMessage === false) {
    throw new AsymmetricEncryptionError("Asymmetric Encryption failed");
  }
  return encryptedMessage;
}

export function decryptMessageAsymmetric(privateKey: string, encryptedMessage: string): string {
  const jsEncrypt = new JSEncrypt();
  jsEncrypt.setPrivateKey(privateKey);
  const decryptedMessage = jsEncrypt.decrypt(encryptedMessage);
  if (decryptedMessage === false) {
    throw new AsymmetricDecryptionError("Asymmetric Decryption failed");
  }
  return decryptedMessage;
}
