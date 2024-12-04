import { useState, useEffect } from 'react';
// import { checkPurchaseHistory } from '@/features/payment/services/credits'; // TODO: handle hiding default text

const DEFAULT_TEXT = `Willkommen bei satz.li!

Dieser Text enthält einige typische Fehler, die Sie mit unserer Software korrigieren lassen können. Probieren Sie es selbst aus:

- Komma fehler, die leicht übersehen werden
- falsche gross und Kleinschreibung bei Nomen
- Rechtschreibfehler wie zum beispiel bei "vleicht" oder "villeicht" 
- Grammatikfehler bei den Zeitformen: "Ich habe gestern nach hause gegangen"
- Inkonsistente schreibweisen wie "Email" und "E-Mail" im selben Text

Um die Korrektur zu starten, wählen Sie einfach eine Sprache aus und klicken Sie auf den "Optimieren" Button. Die KI wird dann alle Fehler erkennen und verbessern.

viel Spass beim Testen!`;

export function useTextState() {
    const [originalText, setOriginalText] = useState("");
    const [text, setText] = useState("");
    const [optimizedText, setOptimizedText] = useState("");
    const [isOptimizationComplete, setIsOptimizationComplete] = useState(false);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);

    useEffect(() => {
        const initializeText = async () => {
            // const { hasPurchased } = await checkPurchaseHistory();
            // setText(hasPurchased ? "" : DEFAULT_TEXT);
            setText(DEFAULT_TEXT);
        };

        initializeText();
    }, []);

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
