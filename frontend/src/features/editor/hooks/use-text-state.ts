import { useState } from 'react';

const DEFAULT_TEXT = 
// 'Ich gehe zu der Markt heute, weil ich brauche Äpfel und Bananen.';

// `Dear Mr. Smith,

// I received your offer yesterday and would like to get more informations about it. It would be helpful if you could provide me some details, especially regarding the delivery time and payment options.

// Please let me know if it is possible to get a discount, since I am interessted in purchasing multiple units. Thank you in advance for your time and assistance.

// Kind regards,
// John Doe`;

`Grüezi Herr Müller,

Ich hoffe es geht Ihnen gut! Ich wollte gerne mit Ihnen sprechen über ein mögliches Projekt, wo ich denke, wir könnte zusammenarbeiten. Das wäre ein große Chance für beides unser Teams, denke ich, und ich wäre froh wenn wir eine lösung finden könnten.

Vielleicht haben Sie schon eine Idee, wie wir diese zusammenarbeit gestalten könnte? Natürlich stehe ich für Fragen gerne zu Verfügung und freue mich von Ihnen zu hören.

Beste Grüsse,
Max`;

export function useTextState() {
    const [originalText, setOriginalText] = useState("");
    const [text, setText] = useState(DEFAULT_TEXT);
    const [optimizedText, setOptimizedText] = useState("");
    const [isOptimizationComplete, setIsOptimizationComplete] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);

    return {
        originalText,
        setOriginalText,
        text,
        setText,
        optimizedText,
        setOptimizedText,
        isOptimizationComplete,
        setIsOptimizationComplete,
        cursorPosition,
        setCursorPosition,
    };
}
