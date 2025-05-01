import boto3
import os
from dotenv import load_dotenv
from uuid import uuid4

load_dotenv()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

BUCKET = os.getenv("S3_BUCKET_NAME")

def upload_file_to_s3(file, filename: str):
    unique_filename = f"{uuid4()}_{filename}"
    s3.upload_fileobj(file.file, BUCKET, unique_filename)
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
