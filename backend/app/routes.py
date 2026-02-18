from flask import current_app as app, request, jsonify
from . import db, bcrypt
from .models import User, Result, Quiz, Question
from .services import generate_quiz_from_api
from flasgger import swag_from
from flask_jwt_extended import (create_access_token, create_refresh_token, get_jwt_identity, verify_jwt_in_request)
from .rbac import permission_required

@app.route('/api/register', methods=['POST'])
@swag_from('../docs/auth_register.yml')
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
@swag_from('../docs/auth_login.yml')
def login():
    data = request.json
    username, password = data.get('username'), data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify(access_token=access_token, refresh_token=refresh_token, role=user.role)
    return jsonify({"error": "Неверные данные"}), 401

@app.route('/api/refresh', methods=['POST'])
@swag_from('../docs/auth_refresh.yml')
def refresh():
    verify_jwt_in_request(refresh=True)
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify(access_token=new_access_token)
    
@app.route('/api/profile')
@swag_from('../docs/auth_profile.yml')
def profile():
    verify_jwt_in_request()
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({"username": user.username, 'role': user.role})

@app.route('/api/questions')
@swag_from('../docs/quiz_get_demo.yml')
def get_questions():
    questions_db = [
        {"id": 1, "question": "Какой фреймворк мы используем для бэкенда?", "options": ["Django", "Flask", "FastAPI"], "answer": "Flask"}
    ]
    return jsonify(questions_db)

@app.route('/api/generate-quiz', methods=['POST'])
@swag_from('../docs/quiz_post_generate.yml')
@permission_required('create_quizzes')
def generate_quiz():
    data = request.json
    context = data.get('text')
    num_questions = data.get('count', 3)
    try:
        quiz_data = generate_quiz_from_api(context, num_questions)
        return jsonify(quiz_data)
    except Exception as e:
        print(f"Error in generate_quiz route: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/results', methods=['GET', 'POST'])
@swag_from('../docs/results.yml')
def handle_results():
    if request.method == 'POST':
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        data = request.json
        quiz_title = data.get('quiz_title', 'Демо-тест')
        new_result = Result(username=user.username, score=data['score'], total=data['total'], quiz_title=quiz_title)
        db.session.add(new_result)
        db.session.commit()
        return jsonify({'message': 'Результат сохранен'}), 201
    else:
        results = Result.query.order_by(Result.score.desc()).all()
        results_list = [{'id': r.id, 'username': r.username, 'score': r.score, 'total': r.total, 'quiz_title': r.quiz_title} for r in results]
        return jsonify(results_list)

@app.route('/api/quizzes', methods=['GET'])
@swag_from('../docs/quizzes_get_all.yml')
def get_all_quizzes():
    verify_jwt_in_request()
    quizzes = Quiz.query.order_by(Quiz.created_at.desc()).all()
    quizzes_list = [{'id': quiz.id, 'title': quiz.title, 'author': quiz.author.username, 'question_count': len(quiz.questions)} for quiz in quizzes]
    return jsonify(quizzes_list)

@app.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
@swag_from('../docs/quizzes_get_one.yml')
def get_quiz_by_id(quiz_id):
    verify_jwt_in_request()
    quiz = Quiz.query.get_or_404(quiz_id)
    questions_list = [{'question': q.text, 'options': q.options, 'answer': q.answer} for q in quiz.questions]
    return jsonify({'id': quiz.id, 'title': quiz.title, 'author': quiz.author.username, 'questions': questions_list})

@app.route('/api/quizzes', methods=['POST'])
@swag_from('../docs/quizzes_post_new.yml')
def save_new_quiz():
    verify_jwt_in_request()
    current_user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    questions_data = data.get('questions')
    if not title or not questions_data: return jsonify({'error': 'Требуется название и вопросы'}), 400
    new_quiz = Quiz(title=title, user_id=current_user_id)
    db.session.add(new_quiz)
    for q_data in questions_data:
        new_question = Question(text=q_data['question'], options=q_data['options'], answer=q_data['answer'], quiz=new_quiz)
        db.session.add(new_question)
    db.session.commit()
    return jsonify({'message': 'Квиз успешно сохранен!', 'quiz_id': new_quiz.id}), 201

@app.route('/api/admin/users/<int:user_id>/role', methods=['POST'])
@permission_required('manage_users')
def change_user_role(user_id):
    data = request.json
    new_role = data.get('role')
    
    if new_role not in ['user', 'admin']:
        return jsonify({'error': 'Недопустимая роль'}), 400

    user_to_edit = User.query.get_or_404(user_id)
    user_to_edit.role = new_role
    db.session.commit()

    return jsonify({'message': f'Роль пользователя {user_to_edit.username} изменена на {new_role}'})