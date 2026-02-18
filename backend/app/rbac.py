from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from .models import User

ROLE_PERMISSIONS = {
    'user': [
        'view_quizzes',
        'create_quizzes',
        'submit_results',
        'view_leaderboard',
        'view_profile'
    ],
    'admin': [
        'view_quizzes',
        'create_quizzes',
        'submit_results',
        'view_leaderboard',
        'view_profile',
        'manage_users'
    ]
}

def get_role_permissions(role):
    return ROLE_PERMISSIONS.get(role, [])

def permission_required(permission_name):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({'error': 'Пользователь не найден'}), 404

            user_perms = get_role_permissions(user.role)

            if permission_name not in user_perms:
                return jsonify({'error': 'Доступ запрещен: недостаточно прав'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator