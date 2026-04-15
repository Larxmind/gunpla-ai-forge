'use client';

import { useState } from 'react';
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manejador para previsualizar la imagen original
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResultImage(null); // Reseteamos el resultado si sube una foto nueva
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // EL MOTOR: Envía los datos al backend
  const handleSubmit = async () => {
    if (!imageFile || !prompt) return;

    setIsLoading(true);
    setErrorMsg(null);

    // Empaquetamos los datos como si fuera un formulario HTML tradicional
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('prompt', prompt);

    try {
      // Llamamos a tu backend de FastAPI (asegúrate de que está corriendo en el 8000)
      //const response = await fetch('http://127.0.0.1:8000/api/v1/generate', {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
        const response = await fetch(`${backendUrl}/api/v1/generate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en el servidor de IA. ¿Está encendido el backend?');
      }

      // El backend nos devuelve la imagen en crudo (bytes), la convertimos a URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResultImage(imageUrl);

    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Ocurrió un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card border-border shadow-2xl relative overflow-hidden">
        
        {/* Detalles decorativos del Cockpit (Esquinas) */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary/40 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary/40 rounded-br-lg pointer-events-none"></div>

        <CardHeader className="border-b border-border/50 pb-6 mb-6">
          <CardTitle 
            className="text-4xl font-bold tracking-tight text-primary uppercase drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
          >
            Gunpla AI Forge
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm uppercase tracking-wider">
            Terminal de Diseño // Sincronización Multi-Agente Activa
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Columna Izquierda: Controles (SPEC_INPUT) */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="picture" className="text-foreground uppercase tracking-widest text-xs font-semibold">ORIGINAL_BMP</Label>
                <Input 
                  id="picture" 
                  type="file" 
                  accept="image/*"
                  className="bg-secondary border-border text-foreground cursor-pointer focus-visible:ring-primary"
                  onChange={handleImageChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-foreground uppercase tracking-widest text-xs font-semibold">TEXT_OVERRIDE</Label>
                <Input 
                  id="prompt" 
                  placeholder="Ej: Camuflaje urbano digital..." 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold tracking-widest uppercase transition-all duration-300 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50"
                disabled={!imageFile || !prompt || isLoading}
              >
                {isLoading ? 'INICIANDO FORJA...' : 'INICIAR FORJA'}
              </Button>

              {errorMsg && (
                <div className="p-3 rounded bg-destructive/20 border border-destructive text-destructive text-sm uppercase tracking-wide">
                  ERROR: {errorMsg}
                </div>
              )}
            </div>

            {/* Columna Derecha: Visualización */}
            <div className="space-y-4">
              
              {/* Original */}
              {imagePreview && !resultImage && (
                <div className="w-full aspect-square rounded overflow-hidden border border-border bg-secondary relative flex items-center justify-center">
                  <img src={imagePreview} alt="Original" className="object-contain w-full h-full opacity-70" />
                  <div className="absolute top-2 left-2 bg-secondary/90 px-2 py-1 text-[10px] font-bold rounded text-muted-foreground uppercase tracking-widest">
                    SYS_REF_IMAGE
                  </div>
                </div>
              )}

              {/* Resultado (BORDE GRUESO NEÓN) */}
              {resultImage && (
                <div className="w-full aspect-square rounded overflow-hidden border-4 border-primary relative bg-secondary shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center">
                  <img src={resultImage} alt="Renderizado" className="object-contain w-full h-full" />
                  <div className="absolute top-2 left-2 bg-primary px-2 py-1 text-[10px] font-bold rounded text-primary-foreground uppercase tracking-widest shadow">
                    RESULT_RENDER_OK
                  </div>
                </div>
              )}

              {/* Estado de Carga (BARRA DE DATOS) */}
              {isLoading && (
                 <div className="w-full aspect-square rounded border border-border bg-secondary/50 flex flex-col items-center justify-center text-primary space-y-6">
                    <div className="w-2/3 h-1 bg-border overflow-hidden rounded-full relative">
                      {/* Barra animada */}
                      <div className="absolute top-0 left-0 h-full bg-primary animate-[pulse_1s_ease-in-out_infinite] w-full"></div>
                    </div>
                    <div className="text-center space-y-2 uppercase tracking-widest">
                      <p className="font-bold text-sm">DATAFRAME_SYNC...</p>
                      <p className="text-[10px] text-muted-foreground">Procesando IA</p>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}