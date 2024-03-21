export function addFontToLocalStorage(cid: string, fileName: string, account: string) {
  const fonts = localStorage.getItem(`HandwrittenFonts_${account}_fonts`);
  const parsedFonts = fonts ? JSON.parse(fonts) : [];

  // Create a new font object
  const newFont = { cid, fileName };

  parsedFonts.push(newFont);

  // Save the updated array back to local storage
  localStorage.setItem(`HandwrittenFonts_${account}_fonts`, JSON.stringify(parsedFonts));
}

export function getFontsFromLocalStorage(account: string) {
  const fonts = localStorage.getItem(`HandwrittenFonts_${account}_fonts`);
  const parsedFonts = fonts ? JSON.parse(fonts) : [];

  return parsedFonts;
}
