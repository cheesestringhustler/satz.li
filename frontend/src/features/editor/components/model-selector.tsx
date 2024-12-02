import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelSelectorProps {
    model: string;
    setModel: (model: string) => void;
}

const models = ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'claude-3-5-sonnet'];
function ModelSelector({ model, setModel }: ModelSelectorProps) {
    return (
        <div className='flex flex-col gap-2'>
            <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                    {models.map((model) => (
                        <SelectItem key={model} value={model}>
                            {model}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default ModelSelector;