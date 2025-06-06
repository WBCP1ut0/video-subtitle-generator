import os
import asyncio
from typing import List
import deepl
from googletrans import Translator
from dotenv import load_dotenv

load_dotenv()

class TranslationService:
    def __init__(self):
        self.deepl_key = os.getenv("DEEPL_API_KEY")
        self.google_translator = Translator()
        self.deepl_translator = None
        
        if self.deepl_key:
            try:
                self.deepl_translator = deepl.Translator(self.deepl_key)
                print("DeepL translator initialized")
            except Exception as e:
                print(f"Failed to initialize DeepL: {e}")
    
    async def translate_batch(self, texts: List[str], source_lang: str, target_lang: str) -> List[str]:
        """Translate a batch of texts using available translation service"""
        
        # Try DeepL first (higher quality)
        if self.deepl_translator:
            try:
                return await self._translate_with_deepl(texts, source_lang, target_lang)
            except Exception as e:
                print(f"DeepL translation failed: {e}, falling back to Google Translate")
        
        # Fallback to Google Translate
        return await self._translate_with_google(texts, source_lang, target_lang)
    
    async def _translate_with_deepl(self, texts: List[str], source_lang: str, target_lang: str) -> List[str]:
        """Translate using DeepL API"""
        # DeepL language code mapping
        deepl_lang_map = {
            'en': 'EN',
            'es': 'ES',
            'fr': 'FR',
            'de': 'DE',
            'it': 'IT',
            'pt': 'PT',
            'zh': 'ZH',
            'ja': 'JA',
            'ru': 'RU',
            'ar': 'AR',
            'hi': 'HI'
        }
        
        source = deepl_lang_map.get(source_lang.lower(), source_lang.upper())
        target = deepl_lang_map.get(target_lang.lower(), target_lang.upper())
        
        # DeepL API call
        def translate_sync():
            results = self.deepl_translator.translate_text(
                texts, 
                source_lang=source if source != target else None,
                target_lang=target
            )
            if isinstance(results, list):
                return [result.text for result in results]
            else:
                return [results.text]
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        translations = await loop.run_in_executor(None, translate_sync)
        
        return translations
    
    async def _translate_with_google(self, texts: List[str], source_lang: str, target_lang: str) -> List[str]:
        """Translate using Google Translate API"""
        
        def translate_sync():
            translations = []
            for text in texts:
                result = self.google_translator.translate(
                    text, 
                    src=source_lang, 
                    dest=target_lang
                )
                translations.append(result.text)
            return translations
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        translations = await loop.run_in_executor(None, translate_sync)
        
        return translations
    
    def get_supported_languages(self) -> dict:
        """Get list of supported languages"""
        return {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ru': 'Russian',
            'ar': 'Arabic',
            'hi': 'Hindi'
        } 