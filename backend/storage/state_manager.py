import json
import os
from datetime import datetime

class StateManager:
    def __init__(self, storage_dir="saved_states"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

    def save_history(self, history: list, parameters: dict, filename: str = None) -> str:
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"experiment_{timestamp}.json"
            
        filepath = os.path.join(self.storage_dir, filename)
        data = {"parameters": parameters, "history": history}
        
        with open(filepath, 'w') as f:
            json.dump(data, f)
        return filename

    def load_history(self, filename: str) -> dict:
        filepath = os.path.join(self.storage_dir, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError("Fișierul nu există.")
        with open(filepath, 'r') as f:
            return json.load(f)

    def list_saves(self) -> list:
        return [f for f in os.listdir(self.storage_dir) if f.endswith('.json')]