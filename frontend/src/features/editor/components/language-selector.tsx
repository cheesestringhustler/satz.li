import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import languages from '@/assets/languages.json';

export interface Language {
    code: string;
    name: string;
}

export interface LanguageSelectorProps {
    language: string;
    setLanguage: (language: string) => void;
    autoDetectEnabled?: boolean;
    onAutoDetectChange?: (checked: boolean) => void;
    isLoading?: boolean;
    className?: string;
}

export function LanguageSelector({ 
    language, 
    setLanguage,
    autoDetectEnabled,
    onAutoDetectChange,
    isLoading,
    className 
}: LanguageSelectorProps) {
    return (
        <Select 
            value={language} 
            onValueChange={setLanguage}
            disabled={autoDetectEnabled || isLoading}
        >
            <SelectTrigger className={cn("w-[200px]", className)}>
                <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
                {(languages as Language[]).map((lang) => (
                    <SelectItem 
                        key={lang.code} 
                        value={lang.code}
                        className="flex items-center justify-between"
                    >
                        <span>{lang.name}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default LanguageSelector;
