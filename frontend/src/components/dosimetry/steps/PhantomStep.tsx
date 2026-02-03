import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PhantomData {
    name: string;
    phantom_type: string;
    dimensions: string;
    material: string;
    position?: string;
    orientation?: string;
}

interface PhantomStepProps {
    data: PhantomData[];
    onChange: (data: PhantomData[]) => void;
}

const phantomTypes = [
    { value: "homogeneous", label: "Homogeneous" },
    { value: "anthropomorphic", label: "Anthropomorphic" },
    { value: "voxel_based", label: "Voxel-based" },
    { value: "chest", label: "Chest" },
    { value: "head", label: "Head" },
    { value: "pelvis", label: "Pelvis" },
    { value: "other", label: "Other" },
];

export function PhantomStep({ data, onChange }: PhantomStepProps) {
    const addPhantom = () => {
        onChange([
            ...data,
            { name: "", phantom_type: "", dimensions: "", material: "", position: "", orientation: "" },
        ]);
    };

    const removePhantom = (index: number) => {
        if (data.length > 1) {
            onChange(data.filter((_, i) => i !== index));
        }
    };

    const updatePhantom = (
        index: number,
        field: keyof PhantomData,
        value: string
    ) => {
        const updated = [...data];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                    Phantoms
                </h2>
                <p className="text-sm text-muted-foreground">
                    Add the phantoms (dosimetric objects) used in this experiment
                </p>
            </div>

            <div className="space-y-4">
                {data.map((phantom, index) => (
                    <div
                        key={index}
                        className="border rounded-lg p-4 space-y-4 relative bg-background"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Phantom {index + 1}
                            </span>
                            {data.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePhantom(index)}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>
                                    Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="e.g., IAEA water phantom"
                                    value={phantom.name}
                                    onChange={(e) => updatePhantom(index, "name", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Phantom Type</Label>
                                <Select
                                    value={phantom.phantom_type}
                                    onValueChange={(value) =>
                                        updatePhantom(index, "phantom_type", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {phantomTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Dimensions (LxWxH)</Label>
                                <Input
                                    placeholder="e.g., 10x10x10"
                                    value={phantom.dimensions}
                                    onChange={(e) =>
                                        updatePhantom(index, "dimensions", e.target.value)
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Format: NxNxN (e.g., 10x10x10)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Material</Label>
                                <Input
                                    placeholder="e.g., Water, Plastic, Tissue-equivalent"
                                    value={phantom.material}
                                    onChange={(e) =>
                                        updatePhantom(index, "material", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Additional parameters for this experiment */}
                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-muted-foreground mb-3">
                                Parameters for this experiment
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input
                                        placeholder="e.g., at isocentre, vertical axis"
                                        value={phantom.position || ""}
                                        onChange={(e) =>
                                            updatePhantom(index, "position", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Orientation</Label>
                                    <Input
                                        placeholder="e.g., horizontal, vertical, perpendicular"
                                        value={phantom.orientation || ""}
                                        onChange={(e) =>
                                            updatePhantom(index, "orientation", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="outline" onClick={addPhantom} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Phantom
            </Button>
        </div>
    );
}
