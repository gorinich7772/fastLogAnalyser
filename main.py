import re
import asyncio
import aiohttp
import uuid
from datetime import datetime
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic_models import Anomaly, AnalysisResponse, SolutionRequest, SolutionResponse
from ollama_client import find_anomalies_in_chunk, get_solution_for_anomalies

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

TIMESTAMP_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}")
# Новая константа для лимита символов
MAX_CHUNK_CHARS = 20000  # Примерно 10,000 токенов (примерно 2 символа = 1 токен)


# --- ФУНКЦИЯ preprocess_and_chunk_log ПОЛНОСТЬЮ ПЕРЕРАБОТАНА ---
def preprocess_and_chunk_log(content: str) -> List[str]:
    # Шаг 1: Считываем и склеиваем многострочные логи
    lines = content.split('\n')
    log_entries = []
    current_entry = ""
    for line in lines:
        if TIMESTAMP_PATTERN.match(line) and current_entry:
            log_entries.append(current_entry)
            current_entry = line
        else:
            current_entry += "\n" + line
    if current_entry:
        log_entries.append(current_entry)

    # Шаг 2: Новый алгоритм чанкинга на основе размера
    if not log_entries:
        return []

    chunks = []
    current_chunk = ""
    for entry in log_entries:
        # Если чанк пуст, добавляем первую запись
        if not current_chunk:
            current_chunk = entry
        # Проверяем, не превысит ли добавление новой записи лимит
        elif len(current_chunk) + len(entry) > MAX_CHUNK_CHARS:
            # Если превысит, "закрываем" текущий чанк
            chunks.append(current_chunk)
            # И начинаем новый чанк с текущей записи
            current_chunk = entry
        else:
            # Иначе просто добавляем к текущему
            current_chunk += entry

    # Не забываем добавить последний, незакрытый чанк
    if current_chunk:
        chunks.append(current_chunk)

    return chunks


@app.get("/")
async def get_index():
    return FileResponse("static/index.html")


# --- Остальной код в main.py остается без изменений ---

@app.post("/api/logs/analyze", response_model=AnalysisResponse)
async def analyze_log(file: UploadFile = File(...)):
    request_uuid = uuid.uuid4()
    request_datetime = datetime.now()

    if not file.filename.endswith(('.log', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file type.")

    content_bytes = await file.read()
    chunks = preprocess_and_chunk_log(content_bytes.decode('utf-8', errors='ignore'))

    print(f"\n>>> [{request_uuid}] Лог-файл обработан и разбит на {len(chunks)} чанков. Начинаю отправку...")
    for i, chunk in enumerate(chunks):
        print(f"\n--- [{request_uuid}] ОТПРАВКА ЧАНКА {i + 1}/{len(chunks)} (Размер: {len(chunk)} симв.) ---")
        # print(chunk) # Вывод чанка, закомментирован, чтобы не засорять консоль
        print("----------------------------------------\n")

    timeout = aiohttp.ClientTimeout(total=3600)  # Настройка тайм-аута 60 минут
    async with aiohttp.ClientSession(timeout=timeout) as session:
        tasks = [find_anomalies_in_chunk(session, chunk) for chunk in chunks]
        results = await asyncio.gather(*tasks)

    all_anomalies = [anomaly for sublist in results for anomaly in sublist]

    return AnalysisResponse(uuid=request_uuid, date_time=request_datetime, anomalies=all_anomalies)


@app.post("/api/logs/solve", response_model=SolutionResponse)
async def solve_anomalies(request: SolutionRequest):
    response_datetime = datetime.now()
    print(f">>> [{request.uuid}] Получен запрос на поиск решения.")

    if not request.anomalies:
        return SolutionResponse(uuid=request.uuid, date_time=response_datetime,
                                answer="Аномалий для анализа не предоставлено.")

    timeout = aiohttp.ClientTimeout(total=1200)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        solution_text = await get_solution_for_anomalies(session, request.anomalies)

    return SolutionResponse(uuid=request.uuid, date_time=response_datetime, answer=solution_text)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)