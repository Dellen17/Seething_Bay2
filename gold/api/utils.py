import requests # type: ignore
import boto3 # type: ignore
from django.conf import settings
from django.core.exceptions import ValidationError

def analyze_sentiment(text):
    """
    Send text to DeepSeek's API for sentiment analysis using the chat completions endpoint.
    """
    url = "https://api.deepseek.com/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "user",
                "content": f"Analyze this text and return the dominant sentiment (positive, negative, or neutral) in a single word: '{text}'"
            }
        ],
        "max_tokens": 10,
        "temperature": 0.3,
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()["choices"][0]["message"]["content"].strip().lower()
        
        valid_sentiments = ["positive", "negative", "neutral"]
        if result in valid_sentiments:
            return result
        else:
            return "neutral"
    except requests.exceptions.RequestException as e:
        print(f"Error calling DeepSeek API: {e}")
        return "neutral"
    except (KeyError, IndexError) as e:
        print(f"Error parsing DeepSeek API response: {e}")
        return "neutral"
    
def analyze_summary(text):
    """
    Send text to DeepSeek's API for summarization using the chat completions endpoint.
    """
    url = "https://api.deepseek.com/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "user",
                "content": f"Summarize these diary entries in 2-3 sentences: {text}"
            }
        ],
        "max_tokens": 150,
        "temperature": 0.3,
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except requests.exceptions.RequestException as e:
        print(f"Error calling DeepSeek API: {e}")
        return "No summary available due to an error."
    except (KeyError, IndexError) as e:
        print(f"Error parsing DeepSeek API response: {e}")
        return "No summary available due to an error."

def upload_to_s3(file_obj, folder, file_name):
    """
    Upload a file to S3 and return the public URL.
    
    Args:
        file_obj: The file object to upload (e.g., request.FILES['image'])
        folder: The S3 folder to upload to (e.g., 'entry_images')
        file_name: The name of the file (e.g., 'myimage.jpg')
    
    Returns:
        The public URL of the uploaded file.
    
    Raises:
        ValidationError: If the upload fails or the file exceeds size limits.
    """
    # Validate file size (max 10MB, as per your original validator)
    max_size_mb = 10
    if file_obj.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"File size exceeds {max_size_mb}MB limit.")

    # Initialize the S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )

    # Define the bucket and S3 key (path)
    bucket_name = 'seething-bay-media-2025'
    s3_key = f"media/{folder}/{file_name}"

    try:
        # Upload the file to S3
        s3_client.upload_fileobj(
            file_obj,
            bucket_name,
            s3_key,
            ExtraArgs={'ContentType': file_obj.content_type}  # Set the correct content type
        )

        # Construct the public URL
        public_url = f"https://{bucket_name}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{s3_key}"
        return public_url
    except Exception as e:
        raise ValidationError(f"Failed to upload file to S3: {str(e)}") 