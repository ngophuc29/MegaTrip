import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, RotateCcw, Move } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn } from "../lib/utils";
import { useToast } from "./ui/use-toast";

interface ImageFile {
  id: string;
  file: File;
  url: string;
  alt?: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

interface ImageUploaderProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUploader({
  value = [],
  onChange,
  maxFiles = 10,
  maxSizePerFile = 5,
  accept = "image/*",
  className,
  disabled = false,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return "Chỉ cho phép tải lên file hình ảnh";
    }
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return `File quá lớn. Kích thước tối đa: ${maxSizePerFile}MB`;
    }
    return null;
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Simulate upload with progress
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate API call
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        const imageId = file.name + Date.now();
        setImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { ...img, progress }
              : img
          )
        );

        if (progress >= 100) {
          clearInterval(interval);
          // Return a mock URL
          const mockUrl = URL.createObjectURL(file);
          setImages(prev => 
            prev.map(img => 
              img.id === imageId 
                ? { ...img, uploading: false, progress: 100 }
                : img
            )
          );
          resolve(mockUrl);
        }
      }, 100);
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - images.length;
    
    if (fileArray.length > remainingSlots) {
      toast({
        title: "Quá nhiều file",
        description: `Chỉ có thể tải lên tối đa ${maxFiles} hình ảnh. Còn lại ${remainingSlots} vị trí.`,
        variant: "destructive"
      });
      return;
    }

    const newImages: ImageFile[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "File không hợp lệ",
          description: error,
          variant: "destructive"
        });
        continue;
      }

      const imageId = file.name + Date.now() + Math.random();
      const imageFile: ImageFile = {
        id: imageId,
        file,
        url: URL.createObjectURL(file),
        uploading: true,
        progress: 0,
      };
      
      newImages.push(imageFile);
    }

    setImages(prev => [...prev, ...newImages]);

    // Upload files
    for (const imageFile of newImages) {
      try {
        await uploadImage(imageFile.file);
      } catch (error) {
        setImages(prev => 
          prev.map(img => 
            img.id === imageFile.id 
              ? { ...img, uploading: false, error: "Upload failed" }
              : img
          )
        );
        toast({
          title: "Upload thất bại",
          description: `Không thể upload ${imageFile.file.name}`,
          variant: "destructive"
        });
      }
    }
  }, [images.length, maxFiles, disabled, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      onChange?.(updated.map(img => img.url));
      return updated;
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      onChange?.(updated.map(img => img.url));
      return updated;
    });
  };

  const retryUpload = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      setImages(prev => 
        prev.map(img => 
          img.id === id 
            ? { ...img, uploading: true, error: undefined, progress: 0 }
            : img
        )
      );
      uploadImage(image.file);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Kéo thả hình ảnh vào đây
          </p>
          <p className="text-sm text-gray-500">
            hoặc{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              chọn file
            </button>
          </p>
          <p className="text-xs text-gray-400">
            Tối đa {maxFiles} file, mỗi file &lt; {maxSizePerFile}MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={disabled}
        />
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group bg-gray-50 rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image.url}
                alt={image.alt || `Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Upload Progress */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Progress 
                      value={image.progress || 0} 
                      className="w-20 mx-auto mb-2"
                    />
                    <p className="text-xs">{image.progress || 0}%</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {image.error && (
                <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-xs mb-2">{image.error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryUpload(image.id)}
                      className="text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Thử lại
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!image.uploading && !image.error && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                    {index > 0 && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6"
                        onClick={() => moveImage(index, index - 1)}
                      >
                        <Move className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Index Number */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có hình ảnh nào</p>
        </div>
      )}
    </div>
  );
}
