import os
import requests
import json
import urllib.parse

def generate_quiz_from_api(context, num_questions):
    API_KEY = os.getenv("OPENROUTER_API_KEY")
    if not API_KEY:
        raise ValueError("OPENROUTER_API_KEY не установлен.")

    API_URL = "https://openrouter.ai/api/v1/chat/completions"
    prompt_text = f"""
Ты — ассистент для создания тестов. Твоя задача — прочитать текст и сгенерировать по нему {num_questions} вопроса(-ов) с тремя вариантами ответа, один из которых правильный. Варианты ответов должны быть перемешаны. Не включай в ответ ничего, кроме JSON-объекта. Не используй Markdown.
Текст:
---
{context}
---
Формат вывода должен быть строго JSON в виде: {{ "questions": [ {{ "question": "Текст вопроса 1", "options": ["Вариант A", "Вариант B", "Вариант C"], "answer": "Правильный вариант" }} ] }}
"""
    headers = { 
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'Quiz Platform'
        }
    payload = {
        "model": "deepseek/deepseek-chat",
        "messages": [ {"role": "user", "content": prompt_text} ],
        "temperature": 0.2,
        "max_tokens": 1500,
        "response_format": {"type": "json_object"},
        "top_p": 1,               # Оставляем стандартным для DeepSeek
        "frequency_penalty": 0,   # Чтобы не штрафовать за повторение терминов из текста
        "presence_penalty": 0     # Чтобы модель не уходила в дебри от темы
    }

    response = requests.post(
        API_URL, 
        headers=headers, 
        json=payload,
    )

    if response.status_code != 200:
        print(f"Ошибка OpenRouter: {response.status_code} - {response.text}")
        response.raise_for_status()
    
    api_response_text = response.json()['choices'][0]['message']['content']
    return json.loads(api_response_text)


def fetch_wikipedia_summary(query):
    query = query.strip().capitalize()
    
    encoded_query = urllib.parse.quote(query.replace(" ", "_"))
    
    url = f"https://ru.wikipedia.org/api/rest_v1/page/summary/{encoded_query}"
    
    try:
        headers = {'User-Agent': 'MyQuizApp/1.0 (contact@example.com)'}
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('extract', '')
        
        print(f"Wiki API returned {response.status_code} for {query}")
        return None
    except Exception as e:
        print(f"Wiki API Error: {e}")
        return None