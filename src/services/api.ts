// API Service for FastAPI Backend
// Configure this URL to match your backend deployment

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types matching your FastAPI models
export interface ArticleCreate {
  titre: string;
  auteurs?: string;
  doi?: string;
}

export interface ArticleResponse extends ArticleCreate {
  id: number;
}

export interface ExperienceCreate {
  description: string;
  article_id: number;
}

export interface ExperienceResponse extends ExperienceCreate {
  id: number;
}

export interface MachineCreate {
  constructeur?: string;
  modele: string;
  type_machine?: string;
  experience_id: number;
}

export interface MachineResponse extends MachineCreate {
  id: number;
}

export interface DetectorCreate {
  type_detecteur?: string;
  modele?: string;
  constructeur?: string;
  experience_id: number;
}

export interface DetectorResponse extends DetectorCreate {
  id: number;
}

export interface DonneeCreate {
  type_donnee?: string;
  unite?: string;
  format_fichier?: string;
  description?: string;
  fichier_path?: string;
  experience_id: number;
  column_mapping?: ColumnMapping[];
}

export interface DonneeResponse extends DonneeCreate {
  id: number;
}

export interface ColumnMapping {
  name: string;
  description: string;
  unit?: string;
  dataType: "numeric" | "categorical" | "text" | "datetime";
}

// API Error handling
class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      errorText || `HTTP error ${response.status}`,
      response.status
    );
  }
  return response.json();
}

// API Methods
export const api = {
  // Articles
  async createArticle(data: ArticleCreate): Promise<ArticleResponse> {
    const response = await fetch(`${API_BASE_URL}/articles/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<ArticleResponse>(response);
  },

  async getArticles(): Promise<ArticleResponse[]> {
    const response = await fetch(`${API_BASE_URL}/articles/`);
    return handleResponse<ArticleResponse[]>(response);
  },

  async getArticle(id: number): Promise<ArticleResponse> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`);
    return handleResponse<ArticleResponse>(response);
  },

  // Experiences
  async createExperience(data: ExperienceCreate): Promise<ExperienceResponse> {
    const response = await fetch(`${API_BASE_URL}/experiences/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<ExperienceResponse>(response);
  },

  async getExperiences(): Promise<ExperienceResponse[]> {
    const response = await fetch(`${API_BASE_URL}/experiences/`);
    return handleResponse<ExperienceResponse[]>(response);
  },

  // Machines
  async createMachine(data: MachineCreate): Promise<MachineResponse> {
    const response = await fetch(`${API_BASE_URL}/machines/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<MachineResponse>(response);
  },

  async getMachines(): Promise<MachineResponse[]> {
    const response = await fetch(`${API_BASE_URL}/machines/`);
    return handleResponse<MachineResponse[]>(response);
  },

  // Detectors
  async createDetector(data: DetectorCreate): Promise<DetectorResponse> {
    const response = await fetch(`${API_BASE_URL}/detectors/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<DetectorResponse>(response);
  },

  async getDetectors(): Promise<DetectorResponse[]> {
    const response = await fetch(`${API_BASE_URL}/detectors/`);
    return handleResponse<DetectorResponse[]>(response);
  },

  // Donnees (Data)
  async createDonnee(data: DonneeCreate): Promise<DonneeResponse> {
    const response = await fetch(`${API_BASE_URL}/donnees/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<DonneeResponse>(response);
  },

  async uploadFile(file: File, experienceId: number): Promise<{ path: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("experience_id", experienceId.toString());

    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<{ path: string }>(response);
  },

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<{ status: string }>(response);
  },
};

export { ApiError };
