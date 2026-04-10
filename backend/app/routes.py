from flask import current_app as app, request, jsonify, Response
from . import db, bcrypt
from .models import User, Result, Quiz, Question
from .services import generate_quiz_from_api
from flasgger import swag_from
from flask_jwt_extended import (create_access_token, create_refresh_token, get_jwt_identity, verify_jwt_in_request)
from .rbac import permission_required
from .storage import upload_file_to_s3


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



@app.route('/api/profile', methods=['GET', 'PUT'])
@swag_from('../docs/auth_profile.yml')
def profile():
    verify_jwt_in_request()
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if request.method == 'GET':
        from .storage import get_presigned_url
        avatar_url = get_presigned_url(user.avatar_url) if user.avatar_url else ""

        return jsonify({
            "username": user.username, 
            "role": user.role,
            "bio": user.bio or "",
            "avatar_url": avatar_url
        })

    if request.method == 'PUT':
        data = request.json
        
        if 'username' in data:
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "Это имя пользователя уже занято"}), 400
            user.username = data['username']
            
        if 'bio' in data:
            user.bio = data['bio']
            
        db.session.commit()
        return jsonify({"message": "Профиль успешно обновлен"})



@app.route('/api/profile/avatar', methods=['POST'])
def upload_avatar():
    verify_jwt_in_request()
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if 'file' not in request.files:
        return jsonify({"error": "Файл не найден"}), 400
        
    file = request.files['file']
    
    from .storage import upload_file_to_s3, delete_file_from_s3, get_presigned_url
    
    if user.avatar_url:
        delete_file_from_s3(user.avatar_url)

    key = upload_file_to_s3(file)
    if key:
        user.avatar_url = key
        db.session.commit()
        return jsonify({"avatar_url": get_presigned_url(key)})
    
    return jsonify({"error": "Ошибка"}), 500



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
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        pagination = Result.query.order_by(Result.score.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        results_list = [{
            'id': r.id, 
            'username': r.username, 
            'score': r.score, 
            'total': r.total, 
            'quiz_title': r.quiz_title
        } for r in pagination.items]
        
        return jsonify({
            'results': results_list,
            'total_pages': pagination.pages,
            'current_page': pagination.page
        })



@app.route('/api/quizzes', methods=['GET'])
@swag_from('../docs/quizzes_get_all.yml')
def get_all_quizzes():
    verify_jwt_in_request()

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 6, type=int)
    search = request.args.get('search', '', type=str)
    sort_by = request.args.get('sort_by', 'created_at', type=str)
    order = request.args.get('order', 'desc', type=str)
    q_count = request.args.get('count', '', type=str) 

    query = Quiz.query

    if search:
        query = query.filter(Quiz.title.ilike(f'%{search}%'))
    
    if q_count and q_count.isdigit():
        from sqlalchemy import func
        from .models import Question
        query = query.join(Question).group_by(Quiz.id).having(func.count(Question.id) == int(q_count))

    sort_column = Quiz.title if sort_by == 'title' else Quiz.created_at
    if order == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    quizzes_list = [{
        'id': quiz.id, 
        'title': quiz.title, 
        'author': quiz.author.username, 
        'question_count': len(quiz.questions),
        'created_at': quiz.created_at.strftime('%Y-%m-%d %H:%M')
    } for quiz in pagination.items]

    return jsonify({
        'quizzes': quizzes_list,
        'total_pages': pagination.pages,
        'current_page': pagination.page,
        'total_items': pagination.total
    })



@app.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
@swag_from('../docs/quizzes_get_one.yml')
def get_quiz_by_id(quiz_id):
    verify_jwt_in_request()
    quiz = Quiz.query.get_or_404(quiz_id)

    from .storage import get_presigned_url

    questions_list = [{'question': q.text, 'options': q.options, 'answer': q.answer} for q in quiz.questions]
    return jsonify({'id': quiz.id, 'title': quiz.title, 'author': quiz.author.username, 'questions': questions_list, 'image_url': get_presigned_url(quiz.image_url)})



@app.route('/api/quizzes/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    verify_jwt_in_request()
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    quiz = Quiz.query.get_or_404(quiz_id)

    if quiz.user_id != current_user_id and user.role != 'admin':
        return jsonify({"error": "У вас нет прав на удаление этого квиза"}), 403

    if quiz.image_url:
        from .storage import delete_file_from_s3
        delete_file_from_s3(quiz.image_url)

    db.session.delete(quiz)
    db.session.commit()

    return jsonify({"message": "Квиз успешно удален"})



@app.route('/api/quizzes', methods=['POST'])
@swag_from('../docs/quizzes_post_new.yml')
def save_new_quiz():
    verify_jwt_in_request()
    current_user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    questions_data = data.get('questions')
    image_url = data.get('image_url')

    if not title or not questions_data: return jsonify({'error': 'Требуется название и вопросы'}), 400
    
    new_quiz = Quiz(title=title, user_id=current_user_id, image_url=image_url)
    db.session.add(new_quiz)
    for q_data in questions_data:
        new_question = Question(text=q_data['question'], options=q_data['options'], answer=q_data['answer'], quiz=new_quiz)
        db.session.add(new_question)
    db.session.commit()
    return jsonify({'message': 'Квиз успешно сохранен!', 'quiz_id': new_quiz.id}), 201



@app.route('/api/quizzes/upload-image', methods=['POST'])
def upload_quiz_image():
    verify_jwt_in_request()
    if 'file' not in request.files:
        return jsonify({"error": "Файл не найден"}), 400
    
    file = request.files['file']
    from .storage import upload_file_to_s3, get_presigned_url
    key = upload_file_to_s3(file, folder="quiz_covers")
    
    if key:
        return jsonify({"image_key": key, "image_url": get_presigned_url(key)})
    return jsonify({"error": "Ошибка загрузки"}), 500



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



@app.route('/robots.txt')
def robots():
    r = Response("User-agent: *\nDisallow: /admin\nDisallow: /profile\nSitemap: http://127.0.0.1:5000/sitemap.xml", mimetype="text/plain")
    return r



@app.route('/sitemap.xml')
def sitemap():
    pages = []
    for rule in ['/', '/community', '/leaderboard']:
        pages.append(f"http://127.0.0.1:5000{rule}")
    
    quizzes = Quiz.query.all()
    for quiz in quizzes:
        pages.append(f"http://127.0.0.1:5000/quiz/{quiz.id}")

    xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    for page in pages:
        xml += f'<url><loc>{page}</loc></url>'
    xml += '</urlset>'
    
    return Response(xml, mimetype='application/xml')



@app.route('/api/external/wiki', methods=['GET'])
def get_wiki_summary():
    query = request.args.get('query')
    if not query: 
        return jsonify({"error": "Запрос пустой"}), 400
    
    from .services import fetch_wikipedia_summary
    text = fetch_wikipedia_summary(query)
    
    if text:
        return jsonify({"text": text})
    
    return jsonify({"error": f"Статья '{query}' не найдена в Википедии"}), 404