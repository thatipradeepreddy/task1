import time
import boto3
import os
from dotenv import load_dotenv
from uuid import uuid4
from fastapi import UploadFile, HTTPException
from boto3.s3.transfer import TransferConfig
import json

load_dotenv()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

BUCKET = os.getenv("S3_BUCKET_NAME")

async def progress_callback(bytes_transferred, total_bytes, start_time, websocket=None):
    percent = (bytes_transferred / total_bytes) * 100
    elapsed_time = time.time() - start_time
    speed = bytes_transferred / elapsed_time if elapsed_time > 0 else 0
    estimated_time = (total_bytes - bytes_transferred) / speed if speed > 0 else 0
    
    progress_data = {
        "percent": round(percent, 2),
        "elapsed_time": round(elapsed_time, 2),
        "speed": round(speed / 1024, 2),  # KB/s
        "estimated_time": round(estimated_time, 2)
    }
    
    if websocket:
        try:
            await websocket.send_text(json.dumps(progress_data))
        except Exception as e:
            print(f"WebSocket send error: {e}")
    print(f"Progress: {progress_data['percent']}% | Elapsed time: {progress_data['elapsed_time']}s | Speed: {progress_data['speed']} KB/s | Estimated time: {progress_data['estimated_time']}s")

async def upload_file_to_s3(file: UploadFile, filename: str, waveguide=None):
    unique_filename = f"{uuid4()}_{filename}"
    
    config = TransferConfig(multipart_chunksize=8 * 1024 * 1024)
    
    upload_id = s3.create_multipart_upload(Bucket=BUCKET, Key=unique_filename)['UploadId']
    
    total_size = file.file.seek(0, os.SEEK_END)
    file.file.seek(0)
    
    part_number = 1
    parts = []
    
    start_time = time.time()
    
    bytes_uploaded = 0
    
    while file_content := file.file.read(config.multipart_chunksize):
        part = s3.upload_part(
            Bucket=BUCKET,
            Key=unique_filename,
            PartNumber=part_number,
            UploadId=upload_id,
            Body=file_content
        )
        
        bytes_uploaded += len(file_content)
        await progress_callback(bytes_uploaded, total_size, start_time, waveguide)
        
        parts.append({'PartNumber': part_number, 'ETag': part['ETag']})
        part_number += 1
    
    s3.complete_multipart_upload(
        Bucket=BUCKET,
        Key=unique_filename,
        UploadId=upload_id,
        MultipartUpload={'Parts': parts}
    )
    
    if waveguide:
        try:
            await waveguide.send_text(json.dumps({"status": "complete"}))
        except Exception as e:
            print(f"WebSocket send error on completion: {e}")
    
    return unique_filename

def get_file_from_s3(s3_key: str):
    try:
        response = s3.get_object(Bucket=BUCKET, Key=s3_key)
        return response['Body'].read()
    except s3.exceptions.NoSuchKey:
        return None

def delete_file_from_s3(s3_key: str):
    try:
        s3.delete_object(Bucket=BUCKET, Key=s3_key)
        return True
    except Exception as e:
        return False

def update_file_in_s3(file, s3_key: str):
    delete_file_from_s3(s3_key)
    return upload_file_to_s3(file, s3_key)