import { useState } from "react";
import { api, ApiError } from "@/services/api";
import type { FormData } from "@/components/dosimetry/FormWizard";
import { useToast } from "@/hooks/use-toast";

interface SubmitState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  articleId: number | null;
}

export function useFormSubmit() {
  const { toast } = useToast();
  const [state, setState] = useState<SubmitState>({
    isSubmitting: false,
    error: null,
    success: false,
    articleId: null,
  });

  const submitForm = async (formData: FormData): Promise<boolean> => {
    setState({ isSubmitting: true, error: null, success: false, articleId: null });

    try {
      // Step 1: Create Article
      const article = await api.createArticle({
        titre: formData.article.title,
        auteurs: formData.article.authors || undefined,
        doi: formData.article.doi || undefined,
      });

      // Step 2: Create Experience
      const experience = await api.createExperience({
        description: formData.experience.description,
        article_id: article.id,
      });

      // Step 3: Create Machines (parallel)
      const machinePromises = formData.machines
        .filter((m) => m.model) // Only submit machines with a model
        .map((machine) =>
          api.createMachine({
            constructeur: machine.manufacturer || undefined,
            modele: machine.model,
            type_machine: machine.machineType || undefined,
            experience_id: experience.id,
          })
        );

      // Step 4: Create Detectors (parallel)
      const detectorPromises = formData.detectors
        .filter((d) => d.detectorType || d.model) // Only submit if has data
        .map((detector) =>
          api.createDetector({
            type_detecteur: detector.detectorType || undefined,
            modele: detector.model || undefined,
            constructeur: detector.manufacturer || undefined,
            experience_id: experience.id,
          })
        );

      // Execute machines and detectors in parallel
      await Promise.all([...machinePromises, ...detectorPromises]);

      // Step 5: Upload file if present
      let filePath: string | undefined;
      if (formData.data.file) {
        const uploadResult = await api.uploadFile(
          formData.data.file,
          experience.id
        );
        filePath = uploadResult.path;
      }

      // Step 6: Create Donnee (data record)
      await api.createDonnee({
        type_donnee: formData.data.dataType || undefined,
        unite: formData.data.unit || undefined,
        format_fichier: formData.data.fileFormat || undefined,
        description: formData.data.description || undefined,
        fichier_path: filePath,
        experience_id: experience.id,
        column_mapping: formData.data.columnMapping,
      });

      setState({
        isSubmitting: false,
        error: null,
        success: true,
        articleId: article.id,
      });

      toast({
        title: "Submission successful!",
        description: `Article "${formData.article.title}" has been saved.`,
      });

      return true;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Failed to submit. Please check your connection and try again.";

      setState({
        isSubmitting: false,
        error: message,
        success: false,
        articleId: null,
      });

      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });

      return false;
    }
  };

  const resetState = () => {
    setState({
      isSubmitting: false,
      error: null,
      success: false,
      articleId: null,
    });
  };

  return {
    ...state,
    submitForm,
    resetState,
  };
}
