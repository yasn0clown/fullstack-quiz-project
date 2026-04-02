import boto3
import os
import uuid
from botocore.config import Config

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=os.getenv("S3_ENDPOINT"),
        aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("S3_SECRET_KEY"),
        region_name=os.getenv("S3_REGION", "us-east-1"),
        config=Config(signature_version='s3v4')
    )

def upload_file_to_s3(file, folder="avatars"):
    s3 = get_s3_client()
    bucket_name = os.getenv("S3_BUCKET_NAME")
    
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{folder}/{uuid.uuid4().hex}.{ext}"

    try:
        s3.upload_fileobj(
            file,
            bucket_name,
            filename,
            ExtraArgs={"ContentType": file.content_type}
        )
        return filename
    except Exception as e:
        print(f"S3 Upload Error: {e}")
        return None

def get_presigned_url(object_name, expires_in=3600):
    if not object_name:
        return None
    
    s3 = get_s3_client()
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': os.getenv("S3_BUCKET_NAME"), 'Key': object_name},
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        print(f"Ошибка генерации ссылки: {e}")
        return None

def delete_file_from_s3(object_name):
    if not object_name:
        return
    s3 = get_s3_client()
    try:
        s3.delete_object(Bucket=os.getenv("S3_BUCKET_NAME"), Key=object_name)
    except Exception as e:
        print(f"Ошибка удаления: {e}")