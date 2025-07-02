import os
import re
import json
import asyncio
import aiohttp
from typing import List
from functools import lru_cache
from pydantic_models import Anomaly, OllamaRequest, OllamaMessage, OllamaResponse

# Загружаем переменные окружения
from dotenv import load_dotenv

load_dotenv()

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL")
OLLAMA_MODEL_ANOMALY = os.getenv("OLLAMA_MODEL_ANOMALY")
OLLAMA_MODEL_SOLUTION = os.getenv("OLLAMA_MODEL_SOLUTION")


@lru_cache(maxsize=2)
def load_prompt(file_path: str) -> str:
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()


async def find_anomalies_in_chunk(session: aiohttp.ClientSession, chunk: str) -> List[Anomaly]:
    prompt = load_prompt("prompts/anomaly_prompt.txt")
    request_data = OllamaRequest(
        model=OLLAMA_MODEL_ANOMALY,
        messages=[
            OllamaMessage(role="system", content=prompt),
            OllamaMessage(role="user", content=chunk)
        ]
    )

    try:
        async with session.post(OLLAMA_API_URL, json=request_data.model_dump()) as response:
            response.raise_for_status()
            data = await response.json()
            ollama_response = OllamaResponse(**data)

            content = ollama_response.message.content
            # Извлекаем JSON из ответа модели
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                anomalies_data = json.loads(json_match.group())
                return [Anomaly(**item) for item in anomalies_data]
    except (aiohttp.ClientError, json.JSONDecodeError, KeyError) as e:
        print(f"Error processing chunk: {e}")
    return []


async def get_solution_for_anomalies(session: aiohttp.ClientSession, anomalies: List[Anomaly]) -> str:
    prompt_template = load_prompt("prompts/solution_prompt.txt")
    anomalies_json = json.dumps([a.model_dump() for a in anomalies], indent=2, ensure_ascii=False)
    final_prompt = prompt_template.replace("{{ANOMALIES_JSON}}", anomalies_json)

    request_data = OllamaRequest(
        model=OLLAMA_MODEL_SOLUTION,
        messages=[OllamaMessage(role="user", content=final_prompt)]
    )

    try:
        async with session.post(OLLAMA_API_URL, json=request_data.model_dump()) as response:
            response.raise_for_status()
            data = await response.json()
            return OllamaResponse(**data).message.content
    except (aiohttp.ClientError, json.JSONDecodeError, KeyError) as e:
        print(f"Error getting solution: {e}")
        return "Не удалось получить решение от модели."