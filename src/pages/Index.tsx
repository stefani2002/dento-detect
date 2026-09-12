import { useState } from "react";
import { Scan, Shield, Zap, Clock, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Button } from "@/components/ui/button";
import { predictCaries, PredictionResult } from "@/services/api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0.5);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setPreview(previewUrl);
    setShowResults(false);
    setPredictionResult(null);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setShowResults(false);
    setPredictionResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setShowResults(true);
    setError(null);

    try {
      // Call FastAPI backend
      const result = await predictCaries(selectedFile, confidence);
      setPredictionResult(result);
    } catch (err) {
      console.error("Detection failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to backend. Make sure FastAPI is running on port 8000.",
      );
      setShowResults(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  //const features = [
  //  {
  //    icon: Zap,
  //    title: "Instant Analysis",
  //    description: "Get results in seconds with our advanced AI",
  //  },
  //  {
  //    icon: Shield,
  //    title: "High Accuracy",
  //    description: "Trained on 5,097 dental X-ray images",
  //  },
  //  {
  //    icon: Clock,
  //    title: "Save Time",
  //    description: "Reduce diagnosis time significantly",
  //  },
  //];

  return (
    <div className="min-h-screen gradient-hero">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6">
            <img
              src="/logoText.png"
              alt="DentoDetect Logo"
              className="w-24 md:w-32 object-contain"
            />
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Detect Dental Caries with
            <span className="gradient-text block">Our Advanced Technology</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your dental X-ray and get instant, accurate detection of
            caries using our state-of-the-art YOLOv8 machine learning model.
          </p>
        </div>

        {/* Features
        <div className="grid md:grid-cols-3 gap-6 mb-12 md:mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl gradient-card shadow-card hover:shadow-elevated transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 shadow-soft">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        */}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Upload / Results Section */}
        <div className="max-w-2xl mx-auto">
          {!showResults ? (
            <>
              <ImageUpload
                onImageSelect={handleImageSelect}
                preview={preview}
                onClear={handleClear}
              />

              {preview && (
                <div className="mt-8 space-y-4 animate-fade-up">
                  {/* Confidence Slider */}
                  <div className="p-4 rounded-xl bg-card shadow-card">
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">
                        Detection Confidence
                      </label>
                      <span className="text-sm font-bold text-primary">
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={confidence}
                      onChange={(e) =>
                        setConfidence(parseFloat(e.target.value))
                      }
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>More detections (10%)</span>
                      <span>Fewer, confident (90%)</span>
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <div className="flex justify-center">
                    <Button
                      variant="hero"
                      size="xl"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      <Scan className="w-5 h-5 mr-2" />
                      Analyze X-ray
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <ResultsDisplay
                imageUrl={
                  predictionResult
                    ? `data:image/jpeg;base64,${predictionResult.annotated_image}`
                    : preview!
                }
                isAnalyzing={isAnalyzing}
                predictionResult={predictionResult}
              />

              {!isAnalyzing && (
                <div className="mt-8 flex justify-center gap-4 animate-fade-up">
                  <Button variant="outline" size="lg" onClick={handleClear}>
                    Upload New Image
                  </Button>
                  <Button variant="gradient" size="lg" onClick={handleAnalyze}>
                    Re-analyze
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            This tool is designed to assist dental professionals and for
            research purposes. Results should be verified by a qualified
            dentist. Not intended for self-diagnosis.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
