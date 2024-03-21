export class AsymmetricEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptionError";
  }
}
