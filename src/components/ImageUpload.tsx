import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  preview: string | null;
  onClear: () => void;
}

export function ImageUpload({
  onImageSelect,
  preview,
  onClear,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            onImageSelect(file, reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [onImageSelect],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
          onImageSelect(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect],
  );

  if (preview) {
    return (
      <div className="relative w-full animate-fade-up">
        <div className="relative rounded-2xl overflow-hidden shadow-card bg-card">
          <img
            src={preview}
            alt="Uploaded X-ray"
            className="w-full h-auto max-h-[500px] object-contain bg-foreground/5"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4 rounded-full shadow-elevated"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-muted-foreground text-sm mt-4">
          X-ray image ready for analysis
        </p>
      </div>
    );
  }

  return (
    <div
      className={`upload-zone ${isDragging ? "active" : ""} animate-fade-up`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center py-8 pointer-events-none">
        <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mb-6 shadow-soft animate-float">
          <Upload className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          Upload X-ray
        </h3>
        <p className="text-muted-foreground text-center max-w-sm mb-4">
          Drag and drop your dental X-ray image here, or click to browse
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="w-4 h-4" />
          <span>Supports JPG formats</span>
        </div>
      </div>
    </div>
  );
}
