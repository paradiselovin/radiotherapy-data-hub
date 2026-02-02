import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ExperienceData {
  description: string;
}

interface ExperienceStepProps {
  data: ExperienceData;
  onChange: (data: ExperienceData) => void;
}

export function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Experiment Details
        </h2>
        <p className="text-sm text-muted-foreground">
          Describe the experimental setup and methodology
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">
            Experiment Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the experimental conditions, methodology, and any relevant parameters used in your dosimetry measurements..."
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Include details about beam energy, field size, measurement conditions, etc.
          </p>
        </div>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium text-sm text-foreground mb-2">
          💡 Tips for a good description
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Specify the radiation type (photons, protons, electrons)</li>
          <li>• Include beam energy and field configurations</li>
          <li>• Describe measurement geometry and setup</li>
          <li>• Note any special conditions or corrections applied</li>
        </ul>
      </div>
    </div>
  );
}
