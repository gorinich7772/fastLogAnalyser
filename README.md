# Fast Log Analyzer
**Fast Log Analyzer** is a web application for intelligent log file analysis. It leverages large language models (LLM) via Ollama to automatically detect anomalies (errors, warnings) in logs and provide comprehensive solutions to address them.

The application implements a two-stage analysis approach:

1. **Anomaly Detection**: The log file is split into chunks and sent to the model in parallel to identify all lines containing errors or warnings.

2. **Solution Generation**: The collected anomalies are passed to the model for comprehensive analysis and to generate a step-by-step plan to resolve the root causes of issues.

**Youtube Link:** https://youtu.be/fKjaAjgAiHE

# 🚀 Features

- **Web Interface**: A simple and user-friendly interface for uploading log files (.log, .txt) and viewing results.

- **Asynchronous Processing**: Efficient handling of large files thanks to an asynchronous architecture based on FastAPI and aiohttp.

- **Intelligent Analysis**: Utilizes customizable LLMs (e.g., Gemma, Mistral, Llama) for accurate detection and resolution of issues.

- **Chunking**: Large log files are automatically split into smaller parts for proper processing by the model without exceeding token limits.

- **Configuration**: Easy configuration of used models and Ollama API address via environment variables.

# 🛠️ Technology Stack
- **Backend**: Python 3.10+

- **Framework**: FastAPI

- **HTTP Client**: Aiohttp

- **Web Server**: Uvicorn

- **AI Platform**: Ollama

- **Frontend**: HTML, TailwindCSS, JavaScript

# ⚙️ Installation and Setup
To deploy the project on your local machine, follow these steps.

**1. Prerequisites**

Ensure you have the following installed:

- **Python 3.10** or later.

- **Ollama**. Installation instructions are available on the official website.

After installing Ollama, download the model to be used for analysis. Recommended models include **Gemma 3**, **Gemma 3n**, **Qwen2.5-coder**.

    ollama pull gemma3n:e4b

# 2. Project Setup
**Clone the repository:**

        git clone https://github.com/gorinich7772/fastLogAnalyzer.git
        cd fastLogAnalyzer

**Create and activate a virtual environment:**

- On macOS / Linux:

        python3 -m venv venv
        source venv/bin/activate

- On Windows:

        python -m venv venv
        venv\Scripts\activate

**Install dependencies from the requirements.txt file:**

    pip install -r requirements.txt

# 3. Configuration
The application is configured using environment variables.

1. **Create a file** .env in the project's root directory by copying env.example (if available) or creating a new one.

2. **Populate the .env file** with the following:

    **URL for accessing the Ollama API**
    OLLAMA_API_URL="http://localhost:11434/api/chat"

    **Model for anomaly detection**
    OLLAMA_MODEL_ANOMALY="gemma3n:e4b"

    **Model for solution generation**
    OLLAMA_MODEL_SOLUTION="gemma3n:e4b"

You can specify any other model downloaded in Ollama.

# 4. Running the Application
Start the Uvicorn web server:

    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Optional: Add the --reload flag for automatic server reloading on code changes.

# 5. Usage
1. Open your browser and navigate to http://localhost:8000.

2. Click the file selection button and upload a log file (.log or .txt).

3. Click the **"Analyze"** button.

4. Wait for the results. Anomalies will appear on the left, and the model-generated solution will appear on the right.

📁 Project Structure
Plaintext

.  
├── static/              # Static frontend files (HTML, CSS, JS)  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── index.html  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── script.js  
├── prompts/             # System prompts for LLM  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── anomaly_prompt.txt  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── solution_prompt.txt  
├── main.py              # Main file with FastAPI endpoints  
├── ollama_client.py     # Client for interacting with Oll Maverick  
├── pydantic_models.py   # Pydantic data models  
├── requirements.txt     # Python dependencies  
└── README.md            # This file  
└── README.ru.md         # Russian version of README