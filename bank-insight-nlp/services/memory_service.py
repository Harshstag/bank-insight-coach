import os
import json
# pyrefly: ignore [missing-import]
import numpy as np
from datetime import datetime
from typing import List, Dict

# We'll use a JSON-based persistent store for long-term memory.
# This ensures memory survives server restarts.

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "chat_memory.json")

class MemoryService:
    def __init__(self):
        self.memory = self._load_memory()

    def _load_memory(self) -> List[Dict]:
        if not os.path.exists(MEMORY_FILE):
            os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)
            with open(MEMORY_FILE, "w") as f:
                json.dump([], f)
            return []
        try:
            with open(MEMORY_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading memory: {e}")
            return []

    def save_interaction(self, user_message: str, assistant_message: str):
        """Store a conversation turn in long-term memory."""
        interaction = {
            "id": len(self.memory) + 1,
            "timestamp": datetime.now().isoformat(),
            "user": user_message,
            "assistant": assistant_message
        }
        self.memory.append(interaction)
        
        try:
            with open(MEMORY_FILE, "w") as f:
                json.dump(self.memory, f, indent=2)
        except Exception as e:
            print(f"Error saving memory: {e}")

    def recall(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Recall similar past interactions using keyword similarity.
        (Ready to be upgraded to Vector Search).
        """
        if not query or not self.memory:
            return []

        query = query.lower()
        query_words = set(query.split())
        scored_memory = []

        for item in self.memory:
            score = 0
            content = item["user"].lower()
            
            for word in query_words:
                if word in content:
                    score += 1
            
            if score > 0:
                scored_memory.append((score, item))

        # Sort by score descending and then by time (recent first)
        scored_memory.sort(key=lambda x: (x[0], x[1]["timestamp"]), reverse=True)
        
        return [item[1] for item in scored_memory[:top_k]]

# Singleton instance
memory_service = MemoryService()

def add_to_memory(user_msg: str, ai_msg: str):
    memory_service.save_interaction(user_msg, ai_msg)

def recall_past_conversations(query: str) -> List[Dict]:
    return memory_service.recall(query)
