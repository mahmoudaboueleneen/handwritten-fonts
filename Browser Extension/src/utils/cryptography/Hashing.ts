import CryptoJS from "crypto-js";

export function hashMessage(message: string) {
  return CryptoJS.SHA3(message).toString();
}
