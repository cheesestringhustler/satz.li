import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface Model {
    id: string;
    name: string;
    description: string;
}

export interface ModelSelectorProps {
    model: string;
    setModel: (model: string) => void;
    className?: string;
}

const models: Model[] = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Works for most requests' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Better at prompts' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Similar to Mini' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Better at prompts' }
];

export function ModelSelector({ model, setModel, className }: ModelSelectorProps) {
    return (
        <Select value={model} onValueChange={setModel}>
            <SelectTrigger className={cn("w-[180px] text-left", className)}>
                <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent align="start">
                {models.map((modelInfo) => (
                    <SelectItem 
                        key={modelInfo.id} 
                        value={modelInfo.id}
                        className="flex flex-col items-start py-3"
                    >
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">{modelInfo.name}</span>
                            <span className="text-xs text-muted-foreground leading-none">{modelInfo.description}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default ModelSelector;