import { Input } from '@/components/ui/input';

interface CustomPromptInputProps {
    customPrompt: string;
    setCustomPrompt: (customPrompt: string) => void;
    onOptimize: () => void;
}

const CustomPromptInput = ({ customPrompt, setCustomPrompt, onOptimize }: CustomPromptInputProps) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onOptimize();
        }
    };

    return (
        <div className='flex flex-col gap-2 flex-1'>
            <Input
                id="customPrompt"
                type="text"
                placeholder="Provide an optional prompt such as 'use passive voice' or 'make it shorter'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

export default CustomPromptInput;
