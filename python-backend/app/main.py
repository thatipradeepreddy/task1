from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.s3_utils import upload_file_to_s3, get_file_from_s3, delete_file_from_s3, update_file_in_s3
from app.dynamodb_utils import save_metadata_to_dynamodb, get_metadata_from_dynamodb, delete_metadata_from_dynamodb, update_metadata_in_dynamodb
from fastapi import Form
from app.email_utils import send_upload_email
from fastapi import WebSocket, WebSocketDisconnect

app = FastAPI()

origins = [
    "*"  # Allow any origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create (Upload)
@app.post("/upload")
async def upload_file(file: UploadFile = File(...), email: str = Form(...)):
    s3_key = upload_file_to_s3(file, file.filename)
    save_metadata_to_dynamodb(file.filename, s3_key, email)
    send_upload_email(email, file.filename, s3_key)
    return {"message": "File uploaded successfully", "s3_key": s3_key}

async def websocket_upload_progress(websocket: WebSocket):
    await websocket.accept()
    
    # Mimic file upload progress and send it in real-time
    total_size = 1000000000  # Set the total file size here (in bytes)
    uploaded = 0
    
    while uploaded < total_size:
        uploaded += 1000000  # Update by chunk size (1 MB)
        percent = (uploaded / total_size) * 100
        await websocket.send_text(f"Progress: {percent:.2f}%")
        await asyncio.sleep(1)  # Simulate a delay between progress updates

    await websocket.send_text("Upload complete!")
    await websocket.close()

# Read (Get file)
@app.get("/file/{s3_key}")
async def get_file(s3_key: str):
    file_content = get_file_from_s3(s3_key)
    if not file_content:
        raise HTTPException(status_code=404, detail="File not found")
    return {"file_content": file_content}

# Update (Overwrite file)
@app.put("/update/{s3_key}")
async def update_file(s3_key: str, file: UploadFile = File(...)):
    updated_s3_key = update_file_in_s3(file, s3_key)
    metadata = get_metadata_from_dynamodb(s3_key)
    if metadata:
        update_metadata_in_dynamodb(s3_key, file.filename)
    return {"message": "File updated successfully", "updated_s3_key": updated_s3_key}

# Delete (File and Metadata)
@app.delete("/delete/{s3_key}")
async def delete_file(s3_key: str):
    # Delete from S3
    file_deleted = delete_file_from_s3(s3_key)
    if not file_deleted:
        raise HTTPException(status_code=404, detail="File not found in S3")
    
    # Delete metadata from DynamoDB
    delete_metadata_from_dynamodb(s3_key)
    
    return {"message": "File and metadata deleted successfully"}

def send_upload_email(email: str, filename: str, s3_key: str):
    # Placeholder email sending logic (currently just logs to console)
    print(f"Email sent to {email} for upload of file '{filename}' with key '{s3_key}'")

