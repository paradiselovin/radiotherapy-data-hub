import { Pencil, FileText, Cpu, Radio, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FormData } from "../FormWizard";

interface SummaryStepProps {
  data: FormData;
  onEdit: (step: number) => void;
}

export function SummaryStep({ data, onEdit }: SummaryStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Review Your Submission
        </h2>
        <p className="text-sm text-muted-foreground">
          Please verify all information before submitting
        </p>
      </div>

      {/* Article Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Article</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Title:</span>{" "}
            {data.article.title || <span className="text-destructive">Not provided</span>}
          </p>
          <p>
            <span className="text-muted-foreground">Authors:</span>{" "}
            {data.article.authors || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">DOI:</span>{" "}
            {data.article.doi || "—"}
          </p>
        </div>
      </div>

      {/* Experience Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Experiment</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <p className="text-sm">
          {data.experience.description || (
            <span className="text-destructive">No description provided</span>
          )}
        </p>
      </div>

      {/* Machines Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Machines</h3>
            <Badge variant="secondary">{data.machines.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="space-y-2">
          {data.machines.map((machine, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm bg-muted/50 rounded px-3 py-2"
            >
              <span className="font-medium">
                {machine.model || "Unnamed machine"}
              </span>
              {machine.manufacturer && (
                <span className="text-muted-foreground">
                  by {machine.manufacturer}
                </span>
              )}
              {machine.machineType && (
                <Badge variant="outline" className="ml-auto">
                  {machine.machineType.toUpperCase()}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detectors Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Detectors</h3>
            <Badge variant="secondary">{data.detectors.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="space-y-2">
          {data.detectors.map((detector, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm bg-muted/50 rounded px-3 py-2"
            >
              <span className="font-medium">
                {detector.model || "Unnamed detector"}
              </span>
              {detector.manufacturer && (
                <span className="text-muted-foreground">
                  by {detector.manufacturer}
                </span>
              )}
              {detector.detectorType && (
                <Badge variant="outline" className="ml-auto">
                  {detector.detectorType.replace("_", " ")}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Dataset</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit(5)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Type:</span>{" "}
            {data.data.dataType || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Unit:</span>{" "}
            {data.data.unit || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Format:</span>{" "}
            {data.data.fileFormat || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">File:</span>{" "}
            {data.data.file?.name || (
              <span className="text-destructive">No file uploaded</span>
            )}
          </p>
          {data.data.description && (
            <p className="mt-2 text-muted-foreground italic">
              "{data.data.description}"
            </p>
          )}
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
        <p className="text-sm text-foreground">
          By submitting, you confirm that this data can be used for deep learning
          research in radiotherapy dose prediction.
        </p>
      </div>
    </div>
  );
}
