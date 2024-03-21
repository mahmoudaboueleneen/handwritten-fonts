export class SymmetricEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SymmetricEncryptionError";
  }
}
