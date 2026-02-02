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

interface DetectorData {
  detectorType: string;
  model: string;
  manufacturer: string;
}

interface DetectorStepProps {
  data: DetectorData[];
  onChange: (data: DetectorData[]) => void;
}

const detectorTypes = [
  { value: "ion_chamber", label: "Ion Chamber" },
  { value: "diode", label: "Diode" },
  { value: "film", label: "Radiochromic Film" },
  { value: "tld", label: "TLD" },
  { value: "osld", label: "OSLD" },
  { value: "diamond", label: "Diamond Detector" },
  { value: "scintillator", label: "Scintillator" },
  { value: "portal_imager", label: "Portal Imager (EPID)" },
  { value: "other", label: "Other" },
];

export function DetectorStep({ data, onChange }: DetectorStepProps) {
  const addDetector = () => {
    onChange([...data, { detectorType: "", model: "", manufacturer: "" }]);
  };

  const removeDetector = (index: number) => {
    if (data.length > 1) {
      onChange(data.filter((_, i) => i !== index));
    }
  };

  const updateDetector = (
    index: number,
    field: keyof DetectorData,
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
          Detection Devices
        </h2>
        <p className="text-sm text-muted-foreground">
          Add the detectors used for dose measurement
        </p>
      </div>

      <div className="space-y-4">
        {data.map((detector, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 space-y-4 relative bg-background"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Detector {index + 1}
              </span>
              {data.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDetector(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Detector Type</Label>
                <Select
                  value={detector.detectorType}
                  onValueChange={(value) =>
                    updateDetector(index, "detectorType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {detectorTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Input
                  placeholder="e.g., PTW, IBA"
                  value={detector.manufacturer}
                  onChange={(e) =>
                    updateDetector(index, "manufacturer", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  placeholder="e.g., Farmer, CC13"
                  value={detector.model}
                  onChange={(e) =>
                    updateDetector(index, "model", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addDetector} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Detector
      </Button>
    </div>
  );
}
