from dotenv import load_dotenv
load_dotenv()
import os
import requests
import json
from datetime import timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flasgger import Swagger, swag_from
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token, JWTManager, get_jwt_identity, verify_jwt_in_request

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
jwt = JWTManager(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'quiz.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Quiz Platform API",
        "description": "API для платформы создания и прохождения тестов.",
        "version": "1.0.0"
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
        }
    },
    "security": [
        {
            "Bearer": []
        }
    ]
}
swagger = Swagger(app, template=swagger_template)

print("Server ready. AI is now handled by OpenRouter API.")


class Result(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

with app.app_context():
    db.create_all()

questions_db = [
    {"id": 1, "question": "Какой фреймворк мы используем для бэкенда?", "options": ["Django", "Flask", "FastAPI"], "answer": "Flask"}
]

@app.route('/api/register', methods=['POST'])
@swag_from('docs/auth_register.yml')
def register():
    data = request.json
    username, password = data.get('username'), data.get('password')
    if not username or not password: return jsonify({"error": "Требуется имя пользователя и пароль"}), 400
    if User.query.filter_by(username=username).first(): return jsonify({"error": "Имя занято"}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Пользователь создан"}), 201

@app.route('/api/login', methods=['POST'])
@swag_from('docs/auth_login.yml')
def login():
    data = request.json
    username, password = data.get('username'), data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify(access_token=access_token, refresh_token=refresh_token)
    return jsonify({"error": "Неверные данные"}), 401

@app.route('/api/refresh', methods=['POST'])
@swag_from('docs/auth_refresh.yml')
def refresh():
    verify_jwt_in_request(refresh=True)
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify(access_token=new_access_token)
    
@app.route('/api/profile')
@swag_from('docs/auth_profile.yml')
def profile():
    verify_jwt_in_request()
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({"username": user.username})

@app.route('/api/questions')
@swag_from('docs/quiz_get_demo.yml')
def get_questions():
    return jsonify(questions_db)

@app.route('/api/results', methods=['GET', 'POST'])
@swag_from('docs/results.yml')
def handle_results():
    if request.method == 'POST':
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        data = request.json
        new_result = Result(username=user.username, score=data['score'], total=data['total'])
        db.session.add(new_result)
        db.session.commit()
        return jsonify({'message': 'Результат сохранен'}), 201
    else:
        results = Result.query.order_by(Result.score.desc()).all()
        results_list = [{'id': r.id, 'username': r.username, 'score': r.score, 'total': r.total} for r in results]
        return jsonify(results_list)

@app.route('/api/generate-quiz', methods=['POST'])
@swag_from('docs/quiz_post_generate.yml')
def generate_quiz():
    verify_jwt_in_request()
    data = request.json
    context = data.get('text')
    num_questions = data.get('count', 3)
    API_KEY = os.getenv("OPENROUTER_API_KEY")
    API_URL = "https://openrouter.ai/api/v1/chat/completions"
    prompt_text = f"""
Ты — ассистент для создания тестов. Твоя задача — прочитать текст и сгенерировать по нему {num_questions} вопроса(-ов) с тремя вариантами ответа, один из которых правильный. Варианты ответов должны быть перемешаны. Не включай в ответ ничего, кроме JSON-объекта. Не используй Markdown.
Текст:
---
{context}
---
Формат вывода должен быть строго JSON в виде: {{ "questions": [ {{ "question": "Текст вопроса 1", "options": ["Вариант A", "Вариант B", "Вариант C"], "answer": "Правильный вариант" }} ] }}
"""
    headers = { "Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json" }
    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [ {"role": "user", "content": prompt_text} ],
        "response_format": {"type": "json_object"}
    }
    try:
        response = requests.post(API_URL, headers=headers, json=payload, params={'HTTP-Referer': 'http://localhost:5000', 'X-Title': 'Quiz Platform'})
        response.raise_for_status()
        api_response_text = response.json()['choices'][0]['message']['content']
        quiz_data = json.loads(api_response_text)
        return jsonify(quiz_data)
    except requests.exceptions.RequestException as e:
        print(f"OpenRouter API request error: {e.response.text if e.response else e}")
        return jsonify({'error': 'Ошибка при обращении к OpenRouter API'}), 503
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"Failed to parse OpenRouter API response: {e}, received: {api_response_text}")
        return jsonify({'error': 'Получен некорректный ответ от нейросети'}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500

if __name__ == '__main__':
    app.run(debug=True)