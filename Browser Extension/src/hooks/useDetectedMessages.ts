import { useContext } from "react";
import { DetectedMessagesContext } from "../contexts/DetectedMessagesContext";

export const useDetectedMessages = () => {
  const context = useContext(DetectedMessagesContext);

  if (context === undefined) {
    throw new Error("useDetectedMessages must be used within a DetectedMessagesProvider");
  }

  return context;
};
