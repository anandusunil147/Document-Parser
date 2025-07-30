import os
from io import BytesIO
from PIL import Image, UnidentifiedImageError
from dotenv import load_dotenv
from pdf2image import convert_from_bytes
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def pil_image_to_gemini_part(pil_image):
    buf = BytesIO()
    pil_image.save(buf, format="PNG")
    return {"mime_type": "image/png", "data": buf.getvalue()}

def generate_answer_from_file(question, file_bytes, filename):
    try:
        if filename.lower().endswith(".pdf"):
            images = convert_from_bytes(file_bytes, dpi=300)
        else:
            image = Image.open(BytesIO(file_bytes))
            image.verify()  # Ensure it's valid
            image = Image.open(BytesIO(file_bytes))  # Re-open for actual use
            images = [image]
    except UnidentifiedImageError:
        return "Uploaded file is not a valid image."
    except Exception as e:
        return f"Error processing file: {str(e)}"

    image_parts = [pil_image_to_gemini_part(img) for img in images]

    prompt = f"""
You are a document understanding assistant. Answer this question based only on the visual content of the document:

Question: {question}
Answer:
"""

    try:
        response = model.generate_content([prompt] + image_parts)
        return response.text.strip()
    except Exception as e:
        return f"Failed to generate answer: {str(e)}"
