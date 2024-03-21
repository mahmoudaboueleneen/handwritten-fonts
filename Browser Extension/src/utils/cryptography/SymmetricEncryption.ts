import CryptoJS from "crypto-js";

import { SymmetricEncryptionError } from "../errors/SymmetricEncryptionError";
import { SymmetricDecryptionError } from "../errors/SymmetricDecryptionError";

export function generateSymmetricKey() {
  return CryptoJS.lib.WordArray.random(256 / 8).toString(CryptoJS.enc.Hex);
}

export function encryptMessageSymmetric(key: string, message: string) {
  const ciphertext = CryptoJS.AES.encrypt(message, key).toString();
  if (!ciphertext) {
    throw new SymmetricEncryptionError("Symmetric Encryption failed");
  }
  return ciphertext;
}

export function decryptMessageSymmetric(key: string, ciphertext: string) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedMessage) {
    throw new SymmetricDecryptionError("Symmetric Decryption failed");
  }
  return decryptedMessage;
}

export async function encryptFileSymmetric(key: string, file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const binaryString = reader.result;
      console.log("Binary string: ", binaryString);
      try {
        const encryptedFile = encryptMessageSymmetric(key, binaryString as string);
        resolve(encryptedFile);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

export async function decryptFileSymmetric(key: string, ciphertext: string) {
  return new Promise<string>((resolve, reject) => {
    try {
      const decryptedMessage = decryptMessageSymmetric(key, ciphertext);
      resolve(decryptedMessage);
    } catch (error) {
      reject(error);
    }
  });
}
