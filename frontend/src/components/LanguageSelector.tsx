import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import languages from '@/assets/languages.json';
import { Label } from '@/components/ui/label';

export function LanguageSelector({ language, setLanguage }: { language: string, setLanguage: (language: string) => void }   ) {
    return (
        <div className='flex flex-col gap-2'>
            {/* <Label htmlFor="language">Language</Label> */}
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
        </div>
    );
}
