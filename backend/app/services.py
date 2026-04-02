import os
import requests
import json

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
        'HTTP-Referer': 'http://localhost:3000',
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