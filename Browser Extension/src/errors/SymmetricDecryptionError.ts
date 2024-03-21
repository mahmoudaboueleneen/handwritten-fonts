export class SymmetricDecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SymmetricDecryptionError";
  }
}
