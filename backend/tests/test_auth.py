import pytest
from app.models import User
from app import db, bcrypt

def test_register(client):
    """Тест регистрации (Пункт 4.1)"""
    response = client.post('/api/register', json={
        "username": "testuser",
        "password": "password123"
    })
    assert response.status_code == 201
    assert response.json['message'] == "Пользователь создан"

def test_login_and_rbac(client):
    """Тест входа и защиты прав доступа (Пункт 3.3)"""
    # 1. Регистрируем пользователя через API (так надежнее, чем лезть в БД)
    client.post('/api/register', json={
        "username": "admin_test",
        "password": "password123"
    })

    # 2. Пытаемся войти
    login_res = client.post('/api/login', json={
        "username": "admin_test",
        "password": "password123"
    })
    
    assert login_res.status_code == 200
    assert 'access_token' in login_res.json
    
    token = login_res.json['access_token']

    # 3. Проверяем доступ к защищенному профилю
    profile_res = client.get('/api/profile', headers={"Authorization": f"Bearer {token}"})
    assert profile_res.status_code == 200

def test_rbac_denied(client):
    """Тест: обычный юзер не может менять роли (Пункт 3.3, 4.3)"""
    # 1. Регистрируем и логиним обычного юзера
    client.post('/api/register', json={"username": "simple_user", "password": "123"})
    login_res = client.post('/api/login', json={"username": "simple_user", "password": "123"})
    token = login_res.json['access_token']

    # 2. Пытаемся вызвать админский роут (изменение роли)
    res = client.post('/api/admin/users/1/role', 
                     json={"role": "admin"},
                     headers={"Authorization": f"Bearer {token}"})
    
    # Должны получить 403 Forbidden
    assert res.status_code == 403
    assert res.json['error'] == "Доступ запрещен: недостаточно прав"