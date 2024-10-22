import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import languages from '@/assets/languages.json';

export default function LanguageDropdown({ language, setLanguage }: { language: string, setLanguage: (language: string) => void }) {
    return (
        <Select onValueChange={setLanguage} defaultValue={language || 'de-ch'}>
            <SelectTrigger className="w-[180px]">
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
    )
}