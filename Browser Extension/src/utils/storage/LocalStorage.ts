import { Contact } from "../../types/Contact.interface";
import { Emotion } from "../../types/Emotion.enum";
import { EmotionToFont } from "../../types/EmotionToFont.type";

export function addFontToLocalStorage(
  emotion: Emotion,
  cid: string,
  fileName: string,
  symmetricKey: string,
  account: string
) {
  const fonts = localStorage.getItem(`HandwrittenFonts_${account}_fonts`);
  const parsedFonts = fonts ? JSON.parse(fonts) : {};

  const newFont = { cid, fileName, symmetricKey };

  const updatedFonts = { ...parsedFonts, [emotion]: newFont };

  localStorage.setItem(`HandwrittenFonts_${account}_fonts`, JSON.stringify(updatedFonts));
}

export function getFontsFromLocalStorage(account: string): EmotionToFont {
  const fonts = localStorage.getItem(`HandwrittenFonts_${account}_fonts`);
  const parsedFonts = fonts ? JSON.parse(fonts) : {};

  return parsedFonts;
}

export function removeFontFromLocalStorage(account: string, fileName: string) {
  const fonts = localStorage.getItem(`HandwrittenFonts_${account}_fonts`);
  const parsedFonts = fonts ? JSON.parse(fonts) : {};

  const updatedFonts = { ...parsedFonts };
  for (const emotion in updatedFonts) {
    if (updatedFonts[emotion].fileName === fileName) {
      delete updatedFonts[emotion];
    }
  }

  localStorage.setItem(`HandwrittenFonts_${account}_fonts`, JSON.stringify(updatedFonts));
}

export function clearFontsFromLocalStorage(account: string) {
  localStorage.removeItem(`HandwrittenFonts_${account}_fonts`);
}

export function addContactToLocalStorage(name: string, address: string, account: string) {
  const contacts = localStorage.getItem(`HandwrittenFonts_${account}_contacts`);
  const parsedContacts = contacts ? JSON.parse(contacts) : [];

  const newContact = { name, address };
  parsedContacts.push(newContact);

  localStorage.setItem(`HandwrittenFonts_${account}_contacts`, JSON.stringify(parsedContacts));
}

export function getContactsFromLocalStorage(account: string): Contact[] | [] {
  const contacts = localStorage.getItem(`HandwrittenFonts_${account}_contacts`);
  const parsedContacts = contacts ? JSON.parse(contacts) : [];

  return parsedContacts;
}

export function removeContactFromLocalStorage(account: string, address: string) {
  const contacts = localStorage.getItem(`HandwrittenFonts_${account}_contacts`);
  const parsedContacts = contacts ? JSON.parse(contacts) : [];

  const updatedContacts = parsedContacts.filter((contact: { address: string }) => contact.address !== address);

  localStorage.setItem(`HandwrittenFonts_${account}_contacts`, JSON.stringify(updatedContacts));
}
