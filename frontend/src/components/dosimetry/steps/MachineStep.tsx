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

interface MachineData {
  manufacturer: string;
  model: string;
  machineType: string;
  energy?: string;
  collimation?: string;
  settings?: string;
}

interface MachineStepProps {
  data: MachineData[];
  onChange: (data: MachineData[]) => void;
}

const machineTypes = [
  { value: "linac", label: "LINAC" },
  { value: "proton", label: "Proton Therapy" },
  { value: "cobalt", label: "Cobalt-60" },
  { value: "cyberknife", label: "CyberKnife" },
  { value: "gammaknife", label: "Gamma Knife" },
  { value: "tomotherapy", label: "TomoTherapy" },
  { value: "other", label: "Other" },
];

export function MachineStep({ data, onChange }: MachineStepProps) {
  const addMachine = () => {
    onChange([...data, { manufacturer: "", model: "", machineType: "", energy: "", collimation: "", settings: "" }]);
  };

  const removeMachine = (index: number) => {
    if (data.length > 1) {
      onChange(data.filter((_, i) => i !== index));
    }
  };

  const updateMachine = (
    index: number,
    field: keyof MachineData,
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
          Treatment Machines
        </h2>
        <p className="text-sm text-muted-foreground">
          Add the radiotherapy equipment used in this experiment
        </p>
      </div>

      <div className="space-y-4">
        {data.map((machine, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 space-y-4 relative bg-background"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Machine {index + 1}
              </span>
              {data.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMachine(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Machine Type</Label>
                <Select
                  value={machine.machineType}
                  onValueChange={(value) =>
                    updateMachine(index, "machineType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {machineTypes.map((type) => (
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
                  placeholder="e.g., Varian, Elekta"
                  value={machine.manufacturer}
                  onChange={(e) =>
                    updateMachine(index, "manufacturer", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Model <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g., TrueBeam, Versa HD"
                  value={machine.model}
                  onChange={(e) => updateMachine(index, "model", e.target.value)}
                />
              </div>
            </div>

            {/* Additional parameters for this experiment */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Parameters for this experiment
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Energy (MV)</Label>
                  <Input
                    placeholder="e.g., 6, 10, 15 MV"
                    value={machine.energy || ""}
                    onChange={(e) => updateMachine(index, "energy", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Collimation</Label>
                  <Input
                    placeholder="e.g., X-jaw, Y-jaw angles"
                    value={machine.collimation || ""}
                    onChange={(e) =>
                      updateMachine(index, "collimation", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Settings</Label>
                  <Input
                    placeholder="e.g., Gantry angle, Dose rate"
                    value={machine.settings || ""}
                    onChange={(e) =>
                      updateMachine(index, "settings", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addMachine} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Machine
      </Button>
    </div>
  );
}
