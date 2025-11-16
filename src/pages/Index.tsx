import { useState, useRef } from "react";
import { Upload, Camera, Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RecyclingResults } from "@/components/RecyclingResults";

interface Material {
  name: string;
  type: string;
  recyclable: string;
  instructions: string;
  preparation: string;
  binType: string;
  notes: string;
}

interface AnalysisResult {
  materials: Material[];
  summary: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setResults(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('identify-material', {
        body: { imageData: selectedImage }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResults(data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKDE0NSw2NSUsNDUlKSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
        
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Recycling Assistant</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Recycle <span className="text-primary">Smarter</span>
              <br />Not Harder
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Take a photo of any item and instantly discover how to recycle it properly. 
              Join the mission to reduce waste and protect our planet.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {!selectedImage ? (
            <Card className="p-8 md:p-12 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Upload or Capture an Image
                  </h2>
                  <p className="text-muted-foreground">
                    Take a photo or upload an image of recyclable materials
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Image
                  </Button>
                  
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    size="lg"
                    variant="outline"
                    className="flex-1 gap-2 border-2 hover:bg-primary/5"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected material"
                    className="w-full h-auto max-h-96 object-contain bg-muted"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-sm font-medium text-foreground">Analyzing materials...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 border-t border-border">
                  <div className="flex gap-3">
                    <Button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Leaf className="w-4 h-4" />
                          Identify Materials
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={resetAnalysis}
                      variant="outline"
                      disabled={isAnalyzing}
                    >
                      Try Another
                    </Button>
                  </div>
                </div>
              </Card>

              {results && <RecyclingResults results={results} />}
            </div>
          )}

          {/* Info Section */}
          {!selectedImage && (
            <div className="mt-16 grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Capture</h3>
                <p className="text-sm text-muted-foreground">
                  Take a photo of any recyclable material or trash item
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Identify</h3>
                <p className="text-sm text-muted-foreground">
                  AI analyzes the materials and identifies recycling potential
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Recycle</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed instructions on where and how to recycle properly
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
