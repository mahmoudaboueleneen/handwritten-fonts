export class AsymmetricDecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecryptionError";
  }
}
