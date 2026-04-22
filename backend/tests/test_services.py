from unittest.mock import patch
from app.services import fetch_wikipedia_summary

def test_wikipedia_api_mock():
    """Тест интеграции с Википедией через Мок (Пункт 5.3)"""
    # Подменяем реальный запрос requests.get
    with patch('requests.get') as mock_get:
        # Имитируем успешный ответ Википедии
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {'extract': 'Тестовый контент из Вики'}
        
        result = fetch_wikipedia_summary("Солнце")
        assert result == 'Тестовый контент из Вики'
        mock_get.assert_called_once()