import os
from google import genai # El nuevo import que ves en tu captura
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("--- Modelos disponibles para tu API Key ---")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"Nombre: {m.name} | Display: {m.display_name}")