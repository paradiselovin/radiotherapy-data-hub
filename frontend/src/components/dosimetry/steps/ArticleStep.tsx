import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ArticleData {
  title: string;
  authors: string;
  doi: string;
}

interface ArticleStepProps {
  data: ArticleData;
  onChange: (data: ArticleData) => void;
}

export function ArticleStep({ data, onChange }: ArticleStepProps) {
  const handleChange = (field: keyof ArticleData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Article Information
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter the publication details for this research
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Article Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g., Deep learning for dose prediction in proton therapy"
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authors">Authors</Label>
          <Input
            id="authors"
            placeholder="e.g., Smith J., Johnson A., Williams B."
            value={data.authors}
            onChange={(e) => handleChange("authors", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple authors with commas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doi">DOI</Label>
          <Input
            id="doi"
            placeholder="e.g., 10.1000/xyz123"
            value={data.doi}
            onChange={(e) => handleChange("doi", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Digital Object Identifier (unique per article)
          </p>
        </div>
      </div>
    </div>
  );
}
