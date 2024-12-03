import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelSelectorProps {
    model: string;
    setModel: (model: string) => void;
}

const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (default)', description: 'works for most requests' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'better at prompts' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'similar to Mini' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3 Sonnet', description: 'better at prompts' }
];

function ModelSelector({ model, setModel }: ModelSelectorProps) {
    return (
        <div className='flex flex-col gap-2'>
            <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                    {models.map((modelInfo) => (
                        <>
                            { modelInfo.description ? <span className="text-xs text-muted-foreground pl-1 pb-0">{`${modelInfo.description}`}</span> : null }
                            <SelectItem key={modelInfo.id} value={modelInfo.id}>
                                {`${modelInfo.name || modelInfo.id}`}
                            </SelectItem>
                        </>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}


export default ModelSelector;