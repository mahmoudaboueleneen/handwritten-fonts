import { Contact } from "../../types/Contact.interface";
import { Font } from "../../types/Font.interface";

export function addFontToLocalStorage(cid: string, fileName: string, symmetricKey: string, account: string) {
  const fonts = localStorage.getItem(`HandwrittenFonts_${account}_fonts`);
  const parsedFonts = fonts ? JSON.parse(fonts) : [];

  const newFont = { cid, fileName, symmetricKey };
  parsedFonts.push(newFont);

  localStorage.setItem(`HandwrittenFonts_${account}_fonts`, JSON.stringify(parsedFonts));
}

export function getFontsFromLocalStorage(account: string): Font[] | [] {
  const fonts = localStorage.getItem(`HandwrittenFonts_${account}_fonts`);
  const parsedFonts = fonts ? JSON.parse(fonts) : [];

  return parsedFonts;
}

export function removeFontFromLocalStorage(account: string, fileName: string) {
  const fonts = localStorage.getItem(`HandwrittenFonts_${account}_fonts`);
  const parsedFonts = fonts ? JSON.parse(fonts) : [];

  const updatedFonts = parsedFonts.filter((font: Font) => font.fileName !== fileName);

  localStorage.setItem(`HandwrittenFonts_${account}_fonts`, JSON.stringify(updatedFonts));
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
