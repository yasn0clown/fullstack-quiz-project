import pytest
from unittest.mock import patch, MagicMock
from app.storage import upload_file_to_s3

def test_upload_to_s3_mock():
    """Тест логики загрузки в облако без интернета (Пункт 5.3)"""
    # Создаем фейковый файл
    file_mock = MagicMock()
    file_mock.filename = "test.png"
    file_mock.content_type = "image/png"

    # Мокаем boto3.client
    with patch('boto3.client') as mock_s3:
        # Настраиваем мок так, чтобы он возвращал успех
        mock_client = MagicMock()
        mock_s3.return_value = mock_client
        
        # Вызываем нашу функцию
        result = upload_file_to_s3(file_mock)
        
        # Проверяем, что функция вернула ключ (путь к файлу)
        assert "avatars/" in result
        assert result.endswith(".png")
        # Проверяем, что метод upload_fileobj реально вызывался
        mock_client.upload_fileobj.assert_called_once()