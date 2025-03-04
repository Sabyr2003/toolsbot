import requests
import re

url = "https://api.forefront.ai/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk-mfY5UVYaM7zGo5DdpfJym9kNyVjWkfIu"
}
data = {
    "model": "forefront/Mistral-7B-claude-chat",
    "messages": [{"role": "user", "content": "Привет!"}],
    "temperature": 0.7,
    "stop": ["<|im_end|>", "<|im_start|>"]  # Попытка убрать разметку
}

response = requests.post(url, json=data, headers=headers)
response_json = response.json()

# Извлекаем ответ модели
raw_text = response_json["choices"][0]["message"]["content"]

# Фильтруем артефакты <|im_start|>, <|im_end|>
clean_text = re.sub(r"<\|im_[a-zA-Z]+\|>", "", raw_text).strip()

print(clean_text)  # Вывод чистого ответа
