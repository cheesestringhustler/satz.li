export async function optimizeText(text: string, language: string, customPrompt: string): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language, customPrompt }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Failed to get response reader');
    }

    return reader;
}