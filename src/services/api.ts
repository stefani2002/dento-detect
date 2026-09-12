const API_URL = "http://localhost:8000"; // or your original backend URL

export interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  class: number;
  class_name: string;
  width: number;
  height: number;
  center_x: number;
  center_y: number;
}

export interface PredictionResult {
  success: boolean;
  filename: string;
  confidence_threshold: number;
  inference_time_ms: number;
  total_detections: number;
  image_width: number;
  image_height: number;
  detections: Detection[];
  annotated_image: string; // base64
}

export async function predictCaries(
  file: File,
  confidence: number = 0.5
): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("confidence", confidence.toString());

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,  // ← ADD THIS!
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Detection failed");
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}