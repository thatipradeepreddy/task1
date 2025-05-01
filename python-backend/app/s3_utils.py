import time
import boto3
import os
from dotenv import load_dotenv
from uuid import uuid4
from fastapi import UploadFile, HTTPException
from boto3.s3.transfer import TransferConfig

load_dotenv()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

BUCKET = os.getenv("S3_BUCKET_NAME")

# Helper function to track progress
def progress_callback(bytes_transferred, total_bytes):
    percent = (bytes_transferred / total_bytes) * 100
    elapsed_time = time.time() - start_time  # Elapsed time for progress calculation
    speed = bytes_transferred / elapsed_time if elapsed_time > 0 else 0
    estimated_time = (total_bytes - bytes_transferred) / speed if speed > 0 else 0
    print(f"Progress: {percent:.2f}% | Elapsed time: {elapsed_time:.2f}s | Speed: {speed/1024:.2f} KB/s | Estimated time: {estimated_time:.2f}s")


# Upload the file in chunks and track progress
def upload_file_to_s3(file: UploadFile, filename: str):
    unique_filename = f"{uuid4()}_{filename}"
    
    # Set the configuration for multipart upload (using default chunk size and retry settings)
    config = TransferConfig(multipart_chunksize=8 * 1024 * 1024)  # 8 MB chunk size
    
    # Start the multi-part upload
    upload_id = s3.create_multipart_upload(Bucket=BUCKET, Key=unique_filename)['UploadId']
    
    total_size = file.file.seek(0, os.SEEK_END)
    file.file.seek(0)
    
    # Upload in parts and track progress
    part_number = 1
    parts = []
    
    global start_time
    start_time = time.time()
    
    bytes_uploaded = 0  # Track uploaded bytes
    
    while file_content := file.file.read(config.multipart_chunksize):
        # Upload part
        part = s3.upload_part(
            Bucket=BUCKET,
            Key=unique_filename,
            PartNumber=part_number,
            UploadId=upload_id,
            Body=file_content
        )
        
        # Track progress manually by calculating the number of bytes uploaded
        bytes_uploaded += len(file_content)
        progress_callback(bytes_uploaded, total_size)
        
        parts.append({'PartNumber': part_number, 'ETag': part['ETag']})
        part_number += 1
    
    # Complete the upload
    s3.complete_multipart_upload(
        Bucket=BUCKET,
        Key=unique_filename,
        UploadId=upload_id,
        MultipartUpload={'Parts': parts}
    )
    
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
