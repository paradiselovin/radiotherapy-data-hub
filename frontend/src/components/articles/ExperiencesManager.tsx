import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { AlertCircle, Plus, Loader2, Settings2 } from "lucide-react";
import { FormWizard } from "@/components/dosimetry/FormWizard";

interface Experience {
    experience_id: number;
    description?: string;
    machine_count?: number;
    detector_count?: number;
    phantom_count?: number;
    data_count?: number;
}

interface ExperiencesManagerProps {
    articleId: number;
    onExperienceAdded?: (experience: Experience) => void;
}

export function ExperiencesManager({
    articleId,
    onExperienceAdded,
}: ExperiencesManagerProps) {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedExperience, setSelectedExperience] =
        useState<Experience | null>(null);

    const loadExperiences = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getArticleExperiences(articleId);
            setExperiences(data.experiences || []);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load experiences";
            setError(message);
            setExperiences([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExperiences();
    }, [articleId]);

    const handleExperienceAdded = async (newExperience: any) => {
        await loadExperiences();
        setShowAddForm(false);
        onExperienceAdded?.(newExperience);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (showAddForm) {
        return (
            <FormWizard
                articleId={articleId}
                onSuccess={handleExperienceAdded}
                onCancel={() => setShowAddForm(false)}
            />
        );
    }

    if (selectedExperience) {
        return (
            <div>
                <div className="mb-4">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedExperience(null)}
                    >
                        ← Back to Experiences
                    </Button>
                </div>
                <FormWizard
                    articleId={articleId}
                    experienceId={selectedExperience.experience_id}
                    onSuccess={handleExperienceAdded}
                    onCancel={() => setSelectedExperience(null)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Experiments</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage experiments for this article
                    </p>
                </div>
                <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experiment
                </Button>
            </div>

            {error && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {experiences.length === 0 ? (
                <div className="text-center py-8 px-4 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">
                        No experiments yet. Create one to get started.
                    </p>
                    <Button onClick={() => setShowAddForm(true)} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Experiment
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {experiences.map((exp) => (
                        <div
                            key={exp.experience_id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-medium">
                                        Experiment {exp.experience_id}
                                    </h4>
                                    {exp.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {exp.description}
                                        </p>
                                    )}
                                    <div className="flex gap-4 mt-3 text-sm">
                                        <span className="text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {exp.machine_count || 0}
                                            </span>{" "}
                                            machine{(exp.machine_count || 0) !== 1 ? "s" : ""}
                                        </span>
                                        <span className="text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {exp.detector_count || 0}
                                            </span>{" "}
                                            detector{(exp.detector_count || 0) !== 1 ? "s" : ""}
                                        </span>
                                        <span className="text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {exp.phantom_count || 0}
                                            </span>{" "}
                                            phantom{(exp.phantom_count || 0) !== 1 ? "s" : ""}
                                        </span>
                                        <span className="text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {exp.data_count || 0}
                                            </span>{" "}
                                            data file{(exp.data_count || 0) !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedExperience(exp)}
                                >
                                    <Settings2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
