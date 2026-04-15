# app/services/gemini_client.py (REESCRITO PARA VERTEX AI & IMAGEN 3)
import os
import io
import vertexai
# Importamos modelos de imagen dedicados, no multimodal general
from vertexai.vision_models import Image, ImageGenerationModel # requires pip install google-cloud-aiplatform
from dotenv import load_dotenv

load_dotenv()

# 1. Inicializamos Vertex AI (esto es un estándar industrial)
# Nota: La librería google-cloud usa automáticamente tus credenciales 
# del proyecto si has configurado 'gcloud auth' o tienes la cuenta activa en Google AI Studio.
vertexai.init(
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),
    location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
)

async def edit_image_with_gemini(image_bytes: bytes, expanded_prompt: str) -> bytes:
    # Paso Técnico: Convertimos los bytes originales directamente a un objeto de imagen de Vertex AI
    # (Esto es mucho más limpio que usar Pillow manualmente, la API lo prefiere)
    input_image_vertex = Image(image_bytes=image_bytes)

    # 2. Cargamos el motor de Imagen 3 (el modelo profesional de tu lista image_0.png)
    # Este modelo es el especialista en aerografía digital
    edit_model = ImageGenerationModel.from_pretrained("imagen-3")

    # 3. Realizamos el Image-to-Image real (Repintado Visibles)
    # La instrucción base es visualmente agresiva para forzar cambios.
    print("Enviando petición de rediseño agresivo a Imagen 3 Pro...")
    response = edit_model.generate_images(
        prompt=(
            "A photorealistic, highly detailed render of the gundam scale model "
            "from the photo, but REPINTED DRAMATICALLY. Apply a visible "
            f"camouflage based on this concept: {expanded_prompt}. "
            "Ensure dramatic color changes, battle weathering, and rust over "
            "the original armor, while maintaining the pose and structure."
        ),
        base_image=input_image_vertex, # Esta es la clave: Image-to-Image estricto
        number_of_images=1
    )

    # 4. Recuperamos el resultado real (bytes de imagen procesados, no texto)
    generated_image_vertex = response.images[0]
    buffer_out = io.BytesIO()
    # Guardamos la salida como PNG para asegurar la máxima calidad
    generated_image_vertex.save(buffer_out, format="PNG")
    
    print("--- Imagen rediseñada con éxito por Imagen 3 Pro ---")
    return buffer_out.getvalue()
