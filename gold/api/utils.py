import requests # type: ignore
from django.conf import settings

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
        
        # Ensure the result is one of the valid sentiments
        valid_sentiments = ["positive", "negative", "neutral"]
        if result in valid_sentiments:
            return result
        else:
            return "neutral"  # Fallback to neutral if the result is invalid
    except requests.exceptions.RequestException as e:
        print(f"Error calling DeepSeek API: {e}")
        return "neutral"  # Fallback to neutral if the API call fails
    except (KeyError, IndexError) as e:
        print(f"Error parsing DeepSeek API response: {e}")
        return "neutral"  # Fallback if response format is unexpected 
    
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
        "max_tokens": 150,  # Adjust for longer summaries
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