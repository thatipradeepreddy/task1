import boto3
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

dynamodb = boto3.resource(
    "dynamodb",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

table = dynamodb.Table(os.getenv("DYNAMODB_TABLE_NAME"))

def save_metadata_to_dynamodb(email: str, filename: str, s3_key: str):
    response = table.put_item(
        Item={
            "email": email,
            "filename": filename,
            "s3_key": s3_key,
            "uploaded_at": datetime.utcnow().isoformat()
        }
    )
    return response


def get_metadata_from_dynamodb(s3_key: str):
    response = table.get_item(
        Key={
            's3_key': s3_key
        }
    )
    return response.get('Item', None)

def delete_metadata_from_dynamodb(s3_key: str):
    response = table.delete_item(
        Key={
            's3_key': s3_key
        }
    )
    return response

def update_metadata_in_dynamodb(s3_key: str, new_filename: str):
    response = table.update_item(
        Key={'s3_key': s3_key},
        UpdateExpression="set filename = :filename",
        ExpressionAttributeValues={':filename': new_filename},
        ReturnValues="UPDATED_NEW"
    )
    return response
