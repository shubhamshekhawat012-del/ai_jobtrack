import logging
from google import genai
from ..config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )
        self.primary_model = "gemini-3.5-flash"
        self.fallback_model = "gemini-3.5-flash-lite"

    def generate_text(self, prompt: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.primary_model,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            logger.warning(f"Primary model {self.primary_model} failed: {e}. Trying fallback {self.fallback_model}.")
            try:
                response = self.client.models.generate_content(
                    model=self.fallback_model,
                    contents=prompt,
                )
                return response.text
            except Exception as fallback_err:
                logger.error(f"Fallback model failed as well: {fallback_err}")
                raise fallback_err


ai_service = AIService()