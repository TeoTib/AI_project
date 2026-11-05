from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from engine.grid import Grid
from storage.state_manager import StateManager

app = FastAPI(title="CelLab API")
state_manager = StateManager()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class SimulatePayload(BaseModel):
    grid: List[List[int]]
    rules: Dict[str, Any]
    steps: int = 1
    store_intermediate: bool = True

class SavePayload(BaseModel):
    history: List[List[List[int]]]
    rules: Dict[str, Any]

@app.post("/simulate")
def run_simulation(payload: SimulatePayload):
    try:
        grid_obj = Grid(payload.grid)
        final_grid, history = grid_obj.simulate(payload.rules, payload.steps, payload.store_intermediate)
        return {"grid": final_grid, "history": history if payload.store_intermediate else [final_grid]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/save")
def save_experiment(payload: SavePayload):
    try:
        filename = state_manager.save_history(payload.history, payload.rules)
        return {"status": "success", "file": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/saves")
def get_saves():
    return {"saves": state_manager.list_saves()}

@app.get("/load/{filename}")
def load_experiment(filename: str):
    try:
        return state_manager.load_history(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Fișier nesăsit.")