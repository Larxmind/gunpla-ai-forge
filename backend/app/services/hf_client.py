# app/services/hf_client.py
import os
import io
import tempfile
import base64
import json
from huggingface_hub import InferenceClient
from gradio_client import Client as GradioClient, handle_file # NUEVO IMPORT
from PIL import Image as PILImage
from dotenv import load_dotenv

load_dotenv()
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# Nuestro único cliente para todo
client = InferenceClient(token=HF_API_KEY)

def expand_prompt(user_input: str) -> str:
    """AGENTE 1: Llama-3 traduce y expande el prompt a formato Stable Diffusion"""
    system_prompt = (
        "You are an AI prompt generator for Stable Diffusion. "
        "Your ONLY job is to translate the user's Spanish request into English "
        "and add visual details. "
        "CRITICAL RULE: DO NOT say 'Here is your prompt', DO NOT use Spanish, "
        "DO NOT write sentences. Output ONLY a comma-separated list of English keywords. "
        "Example: 'urban digital camo, heavy battle damage, mecha, masterpiece'."
    )
    
    response = client.chat_completion(
        model="meta-llama/Meta-Llama-3-8B-Instruct",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        max_tokens=50,
        temperature=0.5 # Muy robótico para que solo escupa keywords
    )
    
    # Limpiamos las comillas que a veces añade el LLM por error
    clean_prompt = response.choices[0].message.content.strip(' "\'\n')
    return clean_prompt

def edit_image_with_space(image_bytes: bytes, prompt: str) -> bytes:
    """AGENTE 3: Conectando al Space FireRed con su API exacta"""
    print(f"\n🎨 HF Pintando con Space (FireRed): {prompt}")
    
    # 1. El truco del Base64: Convertimos los bytes de tu foto al formato de texto raro 
    # que pide este servidor en concreto (un JSON con la imagen en base64)
    b64_img = base64.b64encode(image_bytes).decode('utf-8')
    data_uri = f"data:image/jpeg;base64,{b64_img}"
    images_b64_json = json.dumps([data_uri]) # Lo empaquetamos como array string

    try:
        os.environ["HF_TOKEN"] = HF_API_KEY
        space_client = GradioClient("prithivMLmods/FireRed-Image-Edit-1.0-Fast")
        
        result = space_client.predict(
            images_b64_json=images_b64_json,
            prompt=prompt,
            seed=0,
            randomize_seed=True,
            guidance_scale=1.0, 
            steps=4,
            api_name="/infer"  
        )
        
        # 3. La respuesta es una tupla: (Info_Imagen, Valor_del_Seed). 
        # Sacamos el primer elemento (la imagen)
        image_info = result[0]
        
        # El cliente Gradio puede devolver la ruta directa o un diccionario con la ruta
        final_path = image_info['path'] if isinstance(image_info, dict) else image_info
        
        # 4. Leemos la imagen ya procesada y la devolvemos a tu backend
        with open(final_path, "rb") as f:
            return f.read()
            
    except Exception as e:
        print(f"Error conectando al Space: {e}")
        raise e




