import { Upload, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnMapping } from "./ColumnMappingStep";

interface DataInfo {
  dataType: string;
  fileFormat: string;
  description: string;
  file: File | null;
  columnMapping: ColumnMapping[];
}

interface DataStepProps {
  data: DataInfo;
  onChange: (data: DataInfo) => void;
}

const dataTypes = [
  { value: "pdd", label: "PDD (Percent Depth Dose)" },
  { value: "profile", label: "Beam Profile" },
  { value: "output_factor", label: "Output Factor" },
  { value: "tpr", label: "TPR/TMR" },
  { value: "dose_distribution", label: "3D Dose Distribution" },
  { value: "dvh", label: "DVH (Dose Volume Histogram)" },
  { value: "other", label: "Other" },
];

const fileFormats = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "txt", label: "Text (.txt)" },
  { value: "dicom", label: "DICOM" },
  { value: "npy", label: "NumPy (.npy)" },
  { value: "hdf5", label: "HDF5" },
  { value: "other", label: "Other" },
];

export function DataStep({ data, onChange }: DataStepProps) {
  const handleChange = (field: keyof DataInfo, value: string | File | null) => {
    onChange({ ...data, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleChange("file", file);
  };

  const removeFile = () => {
    handleChange("file", null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Dataset Upload
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload your dosimetry measurement data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Data Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.dataType}
            onValueChange={(value) => handleChange("dataType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select data type" />
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

        <div className="space-y-2 md:col-span-2">
          <Label>File Format</Label>
          <Select
            value={data.fileFormat}
            onValueChange={(value) => handleChange("fileFormat", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {fileFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* File upload */}
      <div className="space-y-2">
        <Label>
          Data File <span className="text-destructive">*</span>
        </Label>
        {data.file ? (
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{data.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(data.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                CSV, Excel, DICOM, or other data formats
              </p>
            </div>
            <Input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls,.txt,.dcm,.npy,.h5,.hdf5"
            />
          </label>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="data-description">Data Description</Label>
        <Textarea
          id="data-description"
          placeholder="Describe the data columns, measurement points, or any preprocessing applied..."
          value={data.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Help us understand the structure of your data
        </p>
      </div>
    </div>
  );
}
