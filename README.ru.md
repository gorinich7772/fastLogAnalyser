# Fast Log Analyzer
**Fast Log Analyzer** — это веб-приложение для интеллектуального анализа лог-файлов. Оно использует большие языковые модели (LLM) через Ollama, чтобы автоматически обнаруживать аномалии (ошибки, предупреждения) в логах и предлагать комплексные решения для их устранения.

Приложение реализует двухэтапный подход к анализу:

1. **Поиск аномалий**: Лог-файл разбивается на части (чанки) и параллельно отправляется модели для выявления всех строк, содержащих ошибки или предупреждения.

3. **Генерация решения**: Собранные аномалии передаются модели для комплексного анализа и формирования пошагового плана по устранению корневых причин проблем.

**Ссылка на Youtube:** https://youtu.be/fKjaAjgAiHE

# 🚀 Возможности

- **Веб-интерфейс**: Простой и удобный интерфейс для загрузки лог-файлов (.log, .txt) и просмотра результатов. 

- **Асинхронная обработка**: Эффективная обработка больших файлов благодаря асинхронной архитектуре на базе FastAPI и aiohttp. 

- **Интеллектуальный анализ**: Использование настраиваемых LLM (например, Gemma, Mistral, Llama) для точного выявления и решения проблем.

- **Разбиение на чанки**: Большие лог-файлы автоматически делятся на небольшие части для корректной обработки моделью без превышения лимита токенов. 

- **Настройка**: Лёгкая настройка используемых моделей и адреса Ollama API через переменные окружения.

# 🛠️ Стек технологий
- **Бэкенд**: Python 3.10+

- **Фреймворк**: FastAPI 

- **HTTP-клиент**: Aiohttp 

- **Веб-сервер**: Uvicorn 

- **AI-платформа**: Ollama

- **Фронтенд**: HTML, TailwindCSS, JavaScript

# ⚙️ Установка и запуск
Для развёртывания проекта на локальной машине выполните следующие шаги.

**1. Предварительные требования**

Убедитесь, что у вас установлены:

- **Python 3.10** или новее.

- **Ollama**. Инструкция по установке есть на официальном сайте.

После установки Ollama необходимо скачать модель, которая будет использоваться для анализа. Рекомендуется **Gemma 3**, **Gemma 3n**, **Qwen2.5-coder**.

    ollama pull gemma3n:e4b

# 2. Установка проекта
**Клонируйте репозиторий:**

        git clone https://github.com/gorinich7772/fastLogAnalyzer.git
        cd fastLogAnalyzer

**Создайте и активируйте виртуальное окружение:**

- На macOS / Linux:

        python3 -m venv venv
        source venv/bin/activate

- На Windows:

        python -m venv venv
        venv\Scripts\activate\

**Установите зависимости из файла requirements.txt:**

    pip install -r requirements.txt

# 3. Конфигурация
Приложение настраивается с помощью переменных окружения.

1. **Создайте файл** .env в корневой папке проекта, скопировав env.example (если он есть) или создав новый.

1. **Заполните файл** .env следующими данными:

    **URL для доступа к API Ollama**
    OLLAMA_API_URL="http://localhost:11434/api/chat"

    **Модель для поиска аномалий**
    OLLAMA_MODEL_ANOMALY="gemma3n:e4b"

    **Модель для генерации решения**
    OLLAMA_MODEL_SOLUTION="gemma3n:e4b"

Вы можете указать любую другую модель, скачанную в Ollama.

# 4. Запуск приложения
Запустите веб-сервер Uvicorn:

    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Опционально: добавьте флаг --reload для автоматической перезагрузки сервера при изменении кода.

# 5. Использование
1. Откройте браузер и перейдите по адресу http://localhost:8000.

3. Нажмите на кнопку выбора файла и загрузите лог-файл (.log или .txt).

5. Нажмите кнопку **"Анализировать"**.

7. Дождитесь результатов. Слева появятся найденные аномалии, а справа — сгенерированное моделью решение.

📁 Структура проекта
Plaintext

.  
├── static/              # Статические файлы фронтенда (HTML, CSS, JS)  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── index.html  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── script.js  
├── prompts/             # Системные промпты для LLM  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── anomaly_prompt.txt  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── solution_prompt.txt  
├── main.py              # Основной файл с эндпоинтами FastAPI  
├── ollama_client.py     # Клиент для взаимодействия с Ollama API  
├── pydantic_models.py   # Модели данных Pydantic  
├── requirements.txt     # Список зависимостей Python  
└── README.md            # Этот файл  