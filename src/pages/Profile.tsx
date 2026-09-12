import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Download } from "lucide-react";
import { toast } from "sonner";

interface Detection {
  id: number;
  image_name: string;
  annotated_image: string;
  num_detections: number;
  confidence: number;
  created_at: string;
}

export default function Profile() {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  const [detections, setDetections] = useState<Detection[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/my-detections", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setDetections(data.detections);
      } catch (error) {
        console.error("Error loading detections", error);
        toast.error("Failed to load detection history");
      } finally {
        setDataLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDetections();
    }
  }, [isAuthenticated]);

  const downloadImage = (base64: string, id: number) => {
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${base64}`;
    link.download = `detection-${id}.jpg`;
    link.click();
    toast.success("Image downloaded!");
  };

  const handleDelete = async (id: number) => {
    // Confirmation
    if (!confirm("Are you sure you want to delete this detection?")) {
      return;
    }

    setDeletingId(id);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/detections/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete detection");
      }

      // Remove from state
      setDetections((prev) => prev.filter((det) => det.id !== id));
      toast.success("Detection deleted successfully!");
    } catch (error) {
      console.error("Error deleting detection:", error);
      toast.error("Failed to delete detection");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Header />

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
          {user?.full_name
            ? `${user.full_name}'s Detection History`
            : "Detection History"}
        </h2>

        {dataLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!dataLoading && detections.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">
              No detections yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Upload an X-ray image to get started!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {detections.map((det, index) => (
            <motion.div
              key={det.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{
                y: -8,
                boxShadow: "0 20px 40px -12px hsl(199 89% 48% / 0.25)",
              }}
              className="rounded-2xl gradient-card shadow-card overflow-hidden relative"
            >
              {/* Delete Button - Top Right */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDelete(det.id)}
                disabled={deletingId === det.id}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete detection"
              >
                {deletingId === det.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <X className="w-4 h-4" />
                )}
              </motion.button>

              {/* Image */}
              <motion.div
                className="overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={`data:image/jpeg;base64,${det.annotated_image}`}
                  alt={det.image_name}
                  className="w-full h-48 object-cover"
                />
              </motion.div>

              {/* Card Content */}
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground mb-1">
                  {det.image_name}
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Detections:</span>{" "}
                  <span
                    className={
                      det.num_detections === 0
                        ? "text-green-500"
                        : det.num_detections <= 2
                          ? "text-yellow-500"
                          : "text-orange-500"
                    }
                  >
                    {det.num_detections}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {Math.round(det.confidence * 100)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(det.created_at).toLocaleString()}
                </p>

                {/* Download Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => downloadImage(det.annotated_image, det.id)}
                  className="mt-3 w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
