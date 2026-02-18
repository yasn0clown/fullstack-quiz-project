from app import create_app, db
from app.models import User
from flask_bcrypt import Bcrypt

app = create_app()
bcrypt = Bcrypt(app)

def create_admin(username, password):
    with app.app_context():
        if User.query.filter_by(username=username).first():
            print(f"Пользователь {username} уже существует.")
            return

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        admin = User(username=username, password_hash=hashed_password, role='admin')
        db.session.add(admin)
        db.session.commit()
        print(f"Администратор {username} успешно создан!")

if __name__ == "__main__":
    create_admin("admin", "admin")