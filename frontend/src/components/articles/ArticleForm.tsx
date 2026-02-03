import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ArticleFormProps {
    onSuccess: (article: any) => void;
}

export function ArticleForm({ onSuccess }: ArticleFormProps) {
    const [formData, setFormData] = useState({
        titre: "",
        auteurs: "",
        doi: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const article = await api.createArticle({
                titre: formData.titre,
                auteurs: formData.auteurs || undefined,
                doi: formData.doi || undefined,
            });

            setSuccess(true);
            setFormData({ titre: "", auteurs: "", doi: "" });

            // Show success message for 2 seconds then reset
            setTimeout(() => {
                onSuccess(article);
            }, 1000);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create article";
            setError(message);
        } finally {
            setLoading(false);
        }
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

            {success && (
                <div className="flex items-start gap-3 p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="font-medium">Article created successfully!</p>
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

            <Button type="submit" disabled={loading || !formData.titre}>
                {loading ? "Creating..." : "Create Article"}
            </Button>
        </form>
    );
}
