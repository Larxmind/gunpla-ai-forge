# app/main.py
from fastapi import FastAPI, UploadFile, Form, HTTPException, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from app.services.hf_client import expand_prompt, edit_image_with_space 

app = FastAPI(
    title="Gunpla AI Customizer API",
    description="Backend para la generación de customizaciones de maquetas mediante IA",
    version="1.0.0"
)

# Configuración de CORS: Permite que el frontend en Next.js (puerto 3000) hable con este backend
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:3000"], 
    allow_origins=["*"],  # Permitir todos los orígenes (¡Cuidado en producción!)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "El Taller de Gunplas está operativo."}

# app/main.py (Fragmento del endpoint)
from app.services.hf_client import expand_prompt


@app.post("/api/v1/generate")
def generate(file: UploadFile = File(...), prompt: str = Form(...)):
    try:
        # Lectura síncrona del archivo subido
        image_data = file.file.read() 
        
        # 1. Razonamiento: Mejoramos el prompt
        rich_prompt = expand_prompt(prompt)
        
        # 2. Generación: Editamos la imagen
        final_image_bytes = edit_image_with_space(image_data, rich_prompt)
        
        return Response(content=final_image_bytes, media_type="image/jpeg")
        
    except Exception as e:
        print(f"Error en el servidor: {e}")
        # Si HF está saturado (503), te lo dirá claramente aquí
        raise HTTPException(status_code=500, detail=str(e))