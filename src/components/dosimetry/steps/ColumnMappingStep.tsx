import { Plus, Trash2, FileSpreadsheet } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export interface ColumnMapping {
  name: string;
  description: string;
  unit: string;
  dataType: "numeric" | "categorical" | "text" | "datetime";
}

interface ColumnMappingStepProps {
  data: ColumnMapping[];
  fileName: string | null;
  onChange: (data: ColumnMapping[]) => void;
}

const dataTypes = [
  { value: "numeric", label: "Numeric (measurements, doses)" },
  { value: "categorical", label: "Categorical (groups, labels)" },
  { value: "text", label: "Text (notes, descriptions)" },
  { value: "datetime", label: "Date/Time" },
];

const commonUnits = [
  { value: "", label: "No unit" },
  { value: "gy", label: "Gy (Gray)" },
  { value: "cgy", label: "cGy (centiGray)" },
  { value: "mm", label: "mm (millimeters)" },
  { value: "cm", label: "cm (centimeters)" },
  { value: "mev", label: "MeV" },
  { value: "mu", label: "MU (Monitor Units)" },
  { value: "percent", label: "%" },
  { value: "custom", label: "Custom..." },
];

export function ColumnMappingStep({ data, fileName, onChange }: ColumnMappingStepProps) {
  const addColumn = () => {
    onChange([
      ...data,
      { name: "", description: "", unit: "", dataType: "numeric" },
    ]);
  };

  const removeColumn = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateColumn = (
    index: number,
    field: keyof ColumnMapping,
    value: string
  ) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value } as ColumnMapping;
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Column Mapping
        </h2>
        <p className="text-sm text-muted-foreground">
          Describe the columns in your dataset to help train the model
        </p>
      </div>

      {/* File reference */}
      {fileName && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{fileName}</span>
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <h3 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
          💡 Why describe columns?
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Column descriptions help our deep learning model understand the meaning
          and context of your data. Include details about measurement conditions,
          normalization, and any preprocessing applied.
        </p>
      </div>

      {/* Column list */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No columns defined yet. Add your dataset columns below.
            </p>
            <Button onClick={addColumn} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Column
            </Button>
          </div>
        ) : (
          data.map((column, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-4 bg-background"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Column {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeColumn(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Column Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., depth, dose, x_position"
                    value={column.name}
                    onChange={(e) => updateColumn(index, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select
                    value={column.dataType}
                    onValueChange={(value) =>
                      updateColumn(index, "dataType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={column.unit}
                    onValueChange={(value) => updateColumn(index, "unit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    placeholder="Describe what this column represents, how it was measured, any normalization applied..."
                    value={column.description}
                    onChange={(e) =>
                      updateColumn(index, "description", e.target.value)
                    }
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {data.length > 0 && (
        <Button variant="outline" onClick={addColumn} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Column
        </Button>
      )}

      {/* Common column examples */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium text-sm text-foreground mb-2">
          📋 Common dosimetry columns
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
          <span className="bg-background px-2 py-1 rounded">depth (mm)</span>
          <span className="bg-background px-2 py-1 rounded">dose (cGy)</span>
          <span className="bg-background px-2 py-1 rounded">x_position (cm)</span>
          <span className="bg-background px-2 py-1 rounded">y_position (cm)</span>
          <span className="bg-background px-2 py-1 rounded">field_size (cm²)</span>
          <span className="bg-background px-2 py-1 rounded">energy (MeV)</span>
          <span className="bg-background px-2 py-1 rounded">ssd (cm)</span>
          <span className="bg-background px-2 py-1 rounded">output_factor</span>
        </div>
      </div>
    </div>
  );
}
