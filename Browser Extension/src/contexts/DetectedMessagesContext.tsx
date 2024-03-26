/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useState } from "react";

import { DetectedMessage } from "../types/DetectedMessage.interface";

interface DetectedMessagesContextProps {
  detectedMessages: DetectedMessage[];
  setDetectedMessages: React.Dispatch<React.SetStateAction<DetectedMessage[]>>;
}

export const DetectedMessagesContext = createContext<DetectedMessagesContextProps | undefined>(undefined);

interface DetectedMessagesProviderProps {
  children: React.ReactNode;
}

export const DetectedMessagesProvider: React.FC<DetectedMessagesProviderProps> = ({ children }) => {
  const [detectedMessages, setDetectedMessages] = useState<DetectedMessage[]>([]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === "DETECTED_MESSAGE") {
        console.log("Detected message", request.message);
        const message = request.message;
        const uuid = request.uuid;

        const detectedMessage: DetectedMessage = { message, uuid };

        setDetectedMessages((prev) => [...prev, detectedMessage]);
      }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(() => {});
    };
  }, []);

  return (
    <DetectedMessagesContext.Provider value={{ detectedMessages, setDetectedMessages }}>
      {children}
    </DetectedMessagesContext.Provider>
  );
};
