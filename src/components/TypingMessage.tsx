"use client";

import React, { useState, useEffect } from 'react';

interface TypingMessageProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export const TypingMessage: React.FC<TypingMessageProps> = ({ 
  text, 
  speed = 15, 
  delay = 300,
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text, speed, isStarted, onComplete]);

  return (
    <div className="relative inline-block">
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {currentIndex < text.length && (
        <span className="inline-block w-[2px] h-[1.1em] bg-indigo-600 ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
};
