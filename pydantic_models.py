from pydantic import BaseModel, Field
from typing import List, Any, Optional
from datetime import datetime
import uuid

class Anomaly(BaseModel):
    timestamp: str
    level: str
    component: str
    message: str
    exception: Optional[Any] = None

class AnalysisResponse(BaseModel):
    uuid: uuid.UUID
    date_time: datetime = Field(default_factory=datetime.now)
    anomalies: List[Anomaly]

class SolutionRequest(BaseModel):
    uuid: uuid.UUID
    anomalies: List[Anomaly]

class SolutionResponse(BaseModel):
    uuid: uuid.UUID
    date_time: datetime = Field(default_factory=datetime.now)
    answer: str

# Модели для запросов к Ollama (без изменений)
class OllamaMessage(BaseModel):
    role: str
    content: str

class OllamaRequest(BaseModel):
    model: str
    messages: List[OllamaMessage]
    stream: bool = False

class OllamaResponse(BaseModel):
    class Message(BaseModel):
        content: str
    message: Message