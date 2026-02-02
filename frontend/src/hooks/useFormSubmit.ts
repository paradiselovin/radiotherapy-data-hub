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

      // Step 2: Create Experience (with optional article_id)
      const experience = await api.createExperience({
        description: formData.experience.description,
        article_id: article.article_id,
      });

      // Step 3: Create Machines (without experience_id)
      const machineCreationPromises = formData.machines
        .filter((m) => m.model)
        .map((machine) =>
          api.createMachine({
            constructeur: machine.manufacturer || undefined,
            modele: machine.model,
            type_machine: machine.machineType || undefined,
          })
        );

      const createdMachines = await Promise.all(machineCreationPromises);

      // Step 4: Link Machines to Experience
      const machineLinkPromises = createdMachines.map((machine) =>
        api.linkMachineToExperience(experience.experience_id, {
          machine_id: machine.machine_id,
          energy: undefined,
          collimation: undefined,
          settings: undefined,
        })
      );

      // Step 5: Create Detectors (without experience_id)
      const detectorCreationPromises = formData.detectors
        .filter((d) => d.detectorType || d.model)
        .map((detector) =>
          api.createDetector({
            type_detecteur: detector.detectorType || undefined,
            modele: detector.model || undefined,
            constructeur: detector.manufacturer || undefined,
          })
        );

      const createdDetectors = await Promise.all(detectorCreationPromises);

      // Step 6: Link Detectors to Experience
      const detectorLinkPromises = createdDetectors.map((detector) =>
        api.linkDetectorToExperience(experience.experience_id, {
          detector_id: detector.detecteur_id,
          position: undefined,
          depth: undefined,
          orientation: undefined,
        })
      );

      // Step 7: Create Phantoms (without experience_id)
      const phantomCreationPromises = formData.phantoms
        .filter((p) => p.name)
        .map((phantom) =>
          api.createPhantom({
            name: phantom.name,
            phantom_type: phantom.phantom_type || undefined,
            dimensions: phantom.dimensions || undefined,
            material: phantom.material || undefined,
          })
        );

      const createdPhantoms = await Promise.all(phantomCreationPromises);

      // Step 8: Link Phantoms to Experience
      const phantomLinkPromises = createdPhantoms.map((phantom) =>
        api.linkPhantomToExperience(experience.experience_id, {
          phantom_id: phantom.phantom_id,
        })
      );

      // Execute all links in parallel
      await Promise.all([
        ...machineLinkPromises,
        ...detectorLinkPromises,
        ...phantomLinkPromises,
      ]);

      // Step 9: Upload data file if present
      if (formData.data.file) {
        await api.uploadDonnee(experience.experience_id, formData.data.file, {
          data_type: formData.data.dataType || "raw",
          unit: formData.data.unit || undefined,
          description: formData.data.description || undefined,
        });
      }

      setState({
        isSubmitting: false,
        error: null,
        success: true,
        articleId: article.article_id,
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
