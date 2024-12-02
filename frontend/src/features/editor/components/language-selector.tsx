import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import languages from '@/assets/languages.json';

interface LanguageSelectorProps {
    language: string;
    setLanguage: (language: string) => void;
}

export function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
    return (
        <div className='flex flex-col gap-2'>
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[190px]">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
