import {
  CheckCircle,
  Download,
  AlertTriangle,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PredictionResult } from "@/services/api";

interface ResultsDisplayProps {
  imageUrl: string;
  isAnalyzing: boolean;
  predictionResult: PredictionResult | null;
}

export function ResultsDisplay({
  imageUrl,
  isAnalyzing,
  predictionResult,
}: ResultsDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "caries-detection-result.jpg";
    link.click();
  };

  const getSeverityInfo = (count: number) => {
    if (count === 0)
      return {
        label: "No Caries Detected",
        color: "text-green-500",
        bg: "bg-green-500/10 border-green-500/20",
      };
    if (count <= 2)
      return {
        label: "Low Severity",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10 border-yellow-500/20",
      };
    if (count <= 5)
      return {
        label: "Moderate Severity",
        color: "text-orange-500",
        bg: "bg-orange-500/10 border-orange-500/20",
      };
    return {
      label: "High Severity",
      color: "text-red-500",
      bg: "bg-red-500/10 border-red-500/20",
    };
  };

  return (
    <div className="w-full space-y-6 animate-fade-up">
      {/* Annotated Image */}
      <div className="relative rounded-2xl overflow-hidden shadow-card bg-card">
        <img
          src={imageUrl}
          alt="Analyzed X-ray with caries detection"
          className="w-full h-auto max-h-[500px] object-contain bg-foreground/5"
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-foreground font-medium">Analyzing X-ray...</p>
              <p className="text-muted-foreground text-sm">
                Running YOLOv8 detection
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {!isAnalyzing && predictionResult && (
        <div className="space-y-4">
          {/* Summary Card */}
          {(() => {
            const severity = getSeverityInfo(predictionResult.total_detections);
            return (
              <div
                className={`p-6 rounded-xl border ${severity.bg} text-center space-y-2`}
              >
                {predictionResult.total_detections === 0 ? (
                  <CheckCircle
                    className={`w-12 h-12 ${severity.color} mx-auto`}
                  />
                ) : (
                  <AlertTriangle
                    className={`w-12 h-12 ${severity.color} mx-auto`}
                  />
                )}
                <h3 className="font-display text-xl font-bold text-foreground">
                  {predictionResult.total_detections === 0
                    ? "No Caries Detected"
                    : `${predictionResult.total_detections} Caries Detected`}
                </h3>
                <p className={`text-sm font-medium ${severity.color}`}>
                  {severity.label}
                </p>
              </div>
            );
          })()}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-card shadow-card text-center">
              <Target className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {predictionResult.total_detections}
              </p>
              <p className="text-xs text-muted-foreground">Detections</p>
            </div>

            <div className="p-4 rounded-xl bg-card shadow-card text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {predictionResult.inference_time_ms}ms
              </p>
              <p className="text-xs text-muted-foreground">Inference</p>
            </div>

            <div className="p-4 rounded-xl bg-card shadow-card text-center">
              <CheckCircle className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {Math.round(predictionResult.confidence_threshold * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Threshold</p>
            </div>
          </div>

          {/* Detection Details Table */}
          {predictionResult.detections.length > 0 && (
            <div className="p-4 rounded-xl bg-card shadow-card">
              <h4 className="font-display font-semibold text-foreground mb-3">
                Detection Details
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                        #
                      </th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                        Confidence
                      </th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                        Position (X, Y)
                      </th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                        Size (W × H)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionResult.detections.map((det, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2 px-3 font-medium text-foreground">
                          {i + 1}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`font-semibold ${
                              det.confidence > 0.7
                                ? "text-green-500"
                                : det.confidence > 0.5
                                  ? "text-yellow-500"
                                  : "text-orange-500"
                            }`}
                          >
                            {Math.round(det.confidence * 100)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          ({Math.round(det.center_x)},{" "}
                          {Math.round(det.center_y)})
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {Math.round(det.width)} × {Math.round(det.height)}px
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Download Button */}
          <div className="text-center">
            <Button variant="outline" size="lg" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Annotated Image
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            ⚕️ Results are for research purposes only. Please consult a
            qualified dental professional for diagnosis.
          </p>
        </div>
      )}
    </div>
  );
}
