import { Emotion } from "./Emotion.enum";
import { Font } from "./Font.interface";

export type EmotionToFont = {
  [K in Emotion]: Font;
};
