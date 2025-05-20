import { useEffect, useState } from "react";


const BotAnswerAnimated = ({ text, setIsAnimating, setTextGeneration }: { text: string; setIsAnimating: (animating: boolean) => void;
setTextGeneration: (generation: number) => void;
}) => {
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (!text) {
      setCurrentText("");
      return;
    }

    setCurrentText("");
    setIsAnimating(true); // Start animation
    setTextGeneration(0); // Reset text generation

    const originalWords = text.trim().split(" ");
    const filteredWords = originalWords.filter((word) => word && word !== "undefined");

    let index = 0;
    const interval = setInterval(() => {
      if (index < filteredWords.length) {
        const newWord = filteredWords[index];
        setCurrentText((prev) => (prev ? `${prev} ${newWord}` : newWord));
        setTextGeneration(index); // Increment text generation
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false); // End animation
        setTextGeneration(filteredWords.length); // Set final text generation
      }
    }, 100);

    return () => {
      clearInterval(interval);
      setIsAnimating(false); // Ensure animation stops on unmount
      setTextGeneration(0); // Reset text generation
    };
  }, [text, setIsAnimating]);

  return <span>{currentText}</span>;
};

export default BotAnswerAnimated;