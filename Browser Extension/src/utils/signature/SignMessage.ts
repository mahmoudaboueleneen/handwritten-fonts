import { HANDWRITTEN_FONTS_SIGNATURE } from "../../constants/HandwrittenFontsSignature";

export function signMessage(message: string, uuid: string): string {
  return `${message}##||tag:${HANDWRITTEN_FONTS_SIGNATURE}||uuid:${uuid}||##`;
}
