from fastapi import FastAPI, UploadFile, File, HTTPException, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.s3_utils import upload_file_to_s3, get_file_from_s3, delete_file_from_s3, update_file_in_s3
from app.dynamodb_utils import save_metadata_to_dynamodb, get_metadata_from_dynamodb, delete_metadata_from_dynamodb, update_metadata_in_dynamodb
from app.email_utils import send_upload_email
import asyncio
from typing import Dict
from uuid import uuid4

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store WebSocket connections with a unique session ID
websocket_sessions: Dict[str, WebSocket] = {}

@app.websocket("/ws/upload-progress/{session_id}")
async def websocket_upload_progress(websocket: WebSocket, session_id: str):
    await websocket.accept()
    websocket_sessions[session_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
        websocket_sessions.pop(session_id, None)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), email: str = Form(...)):
    # Generate a unique session ID for this upload
    session_id = str(uuid4())
    
    # Wait briefly to allow WebSocket connection to establish
    await asyncio.sleep(0.1)
    
    # Get the WebSocket for this session, if available
    websocket = websocket_sessions.get(session_id)
    
    s3_key = await upload_file_to_s3(file, file.filename, websocket)
    save_metadata_to_dynamodb(file.filename, s3_key, email)
    send_upload_email(email, file.filename, s3_key)
    
    # Clean up WebSocket session
    if session_id in websocket_sessions:
        await websocket_sessions[session_id].close()
        websocket_sessions.pop(session_id, None)
    
    return {"message": "File uploaded successfully", "s3_key": s3_key, "session_id": session_id}

@app.get("/file/{s3_key}")
async def get_file(s3_key: str):
    file_content = get_file_from_s3(s3_key)
    if not file_content:
        raise HTTPException(status_code=404, detail="File not found")
    return {"file_content": file_content}

@app.put("/update/{s3_key}")
async def update_file(s3_key: str, file: UploadFile = File(...)):
    updated_s3_key = update_file_in_s3(file, s3_key)
    metadata = get_metadata_from_dynamodb(s3_key)
    if metadata:
        update_metadata_in_dynamodb(s3_key, file.filename)
    return {"message": "File updated successfully", "updated_s3_key": updated_s3_key}

@app.delete("/delete/{s3_key}")
async def delete_file(s3_key: str):
    file_deleted = delete_file_from_s3(s3_key)
    if not file_deleted:
        raise HTTPException(status_code=404, detail="File not found in S3")
    
    delete_metadata_from_dynamodb(s3_key)
    
    return {"message": "File and metadata deleted successfully"}

def send_upload_email(email: str, filename: str, s3_key: str):
    print(f"Email sent to {email} for upload of file '{filename}' with key '{s3_key}'")