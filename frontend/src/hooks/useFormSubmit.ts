import { useState } from "react";
import { api, ApiError } from "@/services/api";
import type { FormData } from "@/components/dosimetry/FormWizard";
import { useToast } from "@/hooks/use-toast";

interface SubmitState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  articleId: number | null;
  failedStep: number | null;
}

// Retry logic for failed requests
const retryRequest = async <T,>(
  request: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;

      // Don't retry on 4xx errors (validation, not found, etc)
      if (error instanceof ApiError && error.statusCode < 500) {
        throw error;
      }

      // Calculate exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export const useFormSubmit = () => {
  const { toast } = useToast();

  const [state, setState] = useState<SubmitState>({
    isSubmitting: false,
    error: null,
    success: false,
    articleId: null,
    failedStep: null,
  });

  const submitForm = async (formData: FormData): Promise<boolean> => {
    setState({ isSubmitting: true, error: null, success: false, articleId: null, failedStep: null });

    try {
      console.log("🎯 Starting atomic submission with complete endpoint...");

      // Prepare complete submission data
      const submissionData = {
        title: formData.article.title,
        authors: formData.article.authors,
        doi: formData.article.doi || undefined,
        experience_description: formData.experience.description,
        machines: formData.machines
          .filter((m) => m.model)
          .map((m) => ({
            manufacturer: m.manufacturer,
            model: m.model,
            machineType: m.machineType,
          })),
        detectors: formData.detectors
          .filter((d) => d.detectorType)
          .map((d) => ({
            detectorType: d.detectorType,
            model: d.model,
            manufacturer: d.manufacturer,
          })),
        phantoms: formData.phantoms
          .filter((p) => p.name)
          .map((p) => ({
            name: p.name,
            phantom_type: p.phantom_type,
            dimensions: p.dimensions,
            material: p.material,
          })),
        file: formData.data.file!,
        data_type: formData.data.dataType || "raw",
        unit: formData.data.unit || undefined,
        data_description: formData.data.description || undefined,
        columnMapping: formData.data.columnMapping || [],
      };

      console.log("📤 Submitting complete experiment to backend (atomic transaction)...");
      const result = await retryRequest(() =>
        api.submitCompleteExperiment(submissionData)
      );

      console.log("✅ Complete submission successful!");
      console.log("Created:", result);

      setState({
        isSubmitting: false,
        error: null,
        success: true,
        articleId: result.article_id,
        failedStep: null,
      });

      toast({
        title: "Submission successful!",
        description: `Article "${formData.article.title}" and experiment have been saved.`,
      });

      return true;
    } catch (error) {
      console.error("❌ Submission error:", error);

      // Determine which step failed based on error message
      let failedStep = 1; // Default to article step
      let message = "Failed to submit. Please check your connection and try again.";

      if (error instanceof ApiError) {
        message = error.message;

        // Try to infer which step failed from error message
        if (message.includes("article")) failedStep = 1;
        else if (message.includes("experience")) failedStep = 2;
        else if (message.includes("machine")) failedStep = 3;
        else if (message.includes("detector")) failedStep = 5;
        else if (message.includes("phantom")) failedStep = 7;
        else if (message.includes("data") || message.includes("file")) failedStep = 9;
      } else if (error instanceof Error) {
        message = error.message;
      }

      console.log(`❌ Failed at step ${failedStep}`);

      setState({
        isSubmitting: false,
        error: message,
        success: false,
        articleId: null,
        failedStep,
      });

      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });

      return false;
    }
  };

  return {
    ...state,
    submitForm,
  };
};
