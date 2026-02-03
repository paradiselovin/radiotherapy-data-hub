import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface ArticleFormData {
    titre: string;
    auteurs?: string;
    doi?: string;
}

interface ArticleFormProps {
    onSuccess: (data: ArticleFormData) => void;
}

export function ArticleForm({ onSuccess }: ArticleFormProps) {
    const [formData, setFormData] = useState<ArticleFormData>({
        titre: "",
        auteurs: "",
        doi: "",
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.titre.trim()) {
            setError("Title is required");
            return;
        }

        // Pass data without making API call - will be submitted later
        onSuccess({
            titre: formData.titre,
            auteurs: formData.auteurs || undefined,
            doi: formData.doi || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="titre">
                    Title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="titre"
                    placeholder="Enter article title"
                    value={formData.titre}
                    onChange={(e) => handleChange("titre", e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="auteurs">Authors</Label>
                <Textarea
                    id="auteurs"
                    placeholder="Enter authors (comma-separated or one per line)"
                    value={formData.auteurs}
                    onChange={(e) => handleChange("auteurs", e.target.value)}
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input
                    id="doi"
                    placeholder="e.g., 10.1234/example"
                    value={formData.doi}
                    onChange={(e) => handleChange("doi", e.target.value)}
                />
            </div>

            <Button type="submit" disabled={!formData.titre}>
                Continue
            </Button>
        </form>
    );
}