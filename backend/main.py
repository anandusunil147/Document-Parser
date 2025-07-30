from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot import generate_answer_from_file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_file_bytes = None
latest_filename = None

@app.post("/upload/")
async def upload_invoice(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')):
        return {"error": "Only PDF or image files are supported."}
    
    global latest_file_bytes, latest_filename
    latest_file_bytes = await file.read()
    latest_filename = file.filename
    return {"message": "File uploaded successfully"}

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask/")
async def ask_question(payload: QuestionRequest):
    if not all([latest_file_bytes, latest_filename]):
        return {"answer": "No document uploaded yet."}
    
    answer = generate_answer_from_file(payload.question, latest_file_bytes, latest_filename)
    return {"answer": answer}
