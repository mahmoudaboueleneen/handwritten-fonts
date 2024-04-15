import { createContext, useState } from 'react';

interface GeneratedFontFilePathContextProps {
  generatedFontFilePath: string;
  setGeneratedFontFilePath: React.Dispatch<React.SetStateAction<string>>;
}

export const GeneratedFontFilePathContext = createContext<
  GeneratedFontFilePathContextProps | undefined
>(undefined);

interface GeneratedFontFilePathProviderProps {
  children: React.ReactNode;
}

export const GeneratedFontFilePathProvider: React.FC<
  GeneratedFontFilePathProviderProps
> = ({ children }) => {
  const [generatedFontFilePath, setGeneratedFontFilePath] =
    useState<string>('');

  return (
    <GeneratedFontFilePathContext.Provider
      value={{ generatedFontFilePath, setGeneratedFontFilePath }}
    >
      {children}
    </GeneratedFontFilePathContext.Provider>
  );
};
