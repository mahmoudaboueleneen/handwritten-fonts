import { useContext } from 'react';
import { GeneratedFontFilePathContext } from '../contexts/GeneratedFontFilePathContext';

export const useGeneratedFontFilePath = () => {
  const context = useContext(GeneratedFontFilePathContext);

  if (context === undefined) {
    throw new Error(
      'useGeneratedFontFilePath must be used within a GeneratedFontPathProvider',
    );
  }

  return context;
};
