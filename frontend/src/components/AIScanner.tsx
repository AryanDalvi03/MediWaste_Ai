import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PredictionResult {
  class: string;
  confidence: number;
  disposal_bin: string;
  hazard_status: string;
  timestamp: string;
  raw_class_id: number;
}

export function AIScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
      setResult(null);
      setIsCameraOpen(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      setFile(null);
      setImage(null);
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Unable to access camera");
      console.error(err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setFile(capturedFile);
            setImage(canvasRef.current!.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze image. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setIsCameraOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Waste Scanner</CardTitle>
          <CardDescription>Upload or capture an image to classify waste type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
            <Button variant="outline" onClick={isCameraOpen ? stopCamera : startCamera}>
              <Camera className="mr-2 h-4 w-4" /> {isCameraOpen ? 'Stop Camera' : 'Camera'}
            </Button>
            {(image || result) && (
              <Button variant="ghost" onClick={resetScanner}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <div className="relative min-h-[300px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
            {isCameraOpen ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <Button className="absolute bottom-4 left-1/2 transform -translate-x-1/2" onClick={captureImage}>Capture</Button>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : image ? (
              <img src={image} alt="Preview" className="w-full h-full object-contain max-h-[400px]" />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center">
                <Upload className="h-8 w-8 mb-2 opacity-50" />
                <p>No image selected</p>
              </div>
            )}
          </div>

          {image && !isCameraOpen && !result && (
            <Button className="w-full" onClick={analyzeImage} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Identify Waste"}
            </Button>
          )}

          {result && (
            <div className="mt-6 space-y-4 border rounded-lg p-4 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Class</Label>
                  <p className="font-bold text-lg text-primary">{result.class}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Bin</Label>
                  <p className="font-semibold">{result.disposal_bin}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className={`font-semibold ${result.hazard_status === 'Hazardous' ? 'text-red-500' : 'text-green-500'}`}>
                    {result.hazard_status}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Confidence</Label>
                  <p className="font-mono">{result.confidence.toFixed(2)}%</p>
                </div>
              </div>
              <div className="text-center border-t pt-4 mt-4">
                <p className="text-xs text-muted-foreground">Scanned at: {result.timestamp}</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default AIScanner;
