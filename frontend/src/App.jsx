import React, { useState, useEffect, useRef } from 'react';

const PRESETS = {
  "BriansBrain": {
    states: [0, 1, 2],
    neighborhood: "moore",
    transitions: [
      { from: 0, neighbor_state: 1, condition: "==", count: 2, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 0 }
    ]
  },
  "ForestFire": {
    states: [0, 1, 2],
    neighborhood: "moore",
    transitions: [
      { from: 2, to: 0 },
      { from: 1, neighbor_state: 2, condition: ">=", count: 1, to: 2 },
      { from: 1, probability: 0.001, to: 2 },
      { from: 0, probability: 0.05, to: 1 }
    ]
  }
};

const COLORS = { 0: "#2c3e50", 1: "#2ecc71", 2: "#e74c3c" };

export default function App() {
  const [grid, setGrid] = useState([]);
  const [history, setHistory] = useState([]);
  const [rules, setRules] = useState(JSON.stringify(PRESETS.BriansBrain, null, 2));
  
  const [steps, setSteps] = useState(1);
  const [storeIntermediate, setStoreIntermediate] = useState(true);
  const [savedFiles, setSavedFiles] = useState([]);
  
  const canvasRef = useRef(null);
  const gridSize = 50, cellSize = 10;

  useEffect(() => {
    const initialGrid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => Math.random() > 0.8 ? 1 : 0)
    );
    setGrid(initialGrid);
    setHistory([initialGrid]);
    fetchSaves();
  }, []);

  useEffect(() => {
    if (!grid.length) return;
    const ctx = canvasRef.current.getContext('2d');
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        ctx.fillStyle = COLORS[cell] || COLORS[0];
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      });
    });
  }, [grid]);

  const fetchSaves = async () => {
    try {
      const res = await fetch('http://localhost:8000/saves');
      const data = await res.json();
      setSavedFiles(data.saves);
    } catch (e) { console.error("Eroare la încărcarea listei de salvări."); }
  };

  const handleSimulate = async () => {
    try {
      const parsedRules = JSON.parse(rules);
      const res = await fetch('http://localhost:8000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid, rules: parsedRules, steps, store_intermediate: storeIntermediate })
      });
      const data = await res.json();
      setGrid(data.grid);
      setHistory(storeIntermediate ? [...history, ...data.history] : [...history, data.grid]);
    } catch (e) { alert("Eroare: " + e.message); }
  };

  const handleSave = async () => {
    try {
      const parsedRules = JSON.parse(rules);
      await fetch('http://localhost:8000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, rules: parsedRules })
      });
      alert(`Salvat cu succes!`);
      fetchSaves();
    } catch (e) { alert("Eroare la salvare: " + e.message); }
  };

  const handleLoad = async (filename) => {
    if (!filename) return;
    try {
      const res = await fetch(`http://localhost:8000/load/${filename}`);
      const data = await res.json();
      setRules(JSON.stringify(data.parameters, null, 2));
      setHistory(data.history);
      setGrid(data.history[data.history.length - 1]);
    } catch (e) { alert("Eroare la încărcare: " + e.message); }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'sans-serif' }}>
      <div>
        <h2>CelLab Canvas</h2>
        <canvas ref={canvasRef} width={gridSize * cellSize} height={gridSize * cellSize} style={{ border: '1px solid black' }} />
        
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label>Iterații (N): <input type="number" value={steps} onChange={e => setSteps(Number(e.target.value))} style={{ width: '50px' }} /></label>
            <label style={{ marginLeft: '15px' }}>
              <input type="checkbox" checked={storeIntermediate} onChange={e => setStoreIntermediate(e.target.checked)} />
              Stochează intermediar
            </label>
          </div>
          <div>
            <button onClick={handleSimulate} style={{ padding: '8px 16px', marginRight: '10px' }}>Run Simulation</button>
            <button onClick={handleSave} style={{ padding: '8px 16px' }}>Save History</button>
          </div>
          <div>
            <select onChange={(e) => handleLoad(e.target.value)} defaultValue="">
              <option value="" disabled>Incarcă stare salvată (Recovery)</option>
              {savedFiles.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <div style={{ flexGrow: 1 }}>
        <h2>Reguli Dinamice (JSON)</h2>
        <select onChange={(e) => { if(PRESETS[e.target.value]) setRules(JSON.stringify(PRESETS[e.target.value], null, 2)) }} style={{ marginBottom: '10px', padding: '5px' }}>
          <option value="BriansBrain">Brian's Brain</option>
          <option value="ForestFire">Forest Fire</option>
        </select>
        <textarea value={rules} onChange={(e) => setRules(e.target.value)} style={{ width: '100%', height: '400px', fontFamily: 'monospace', padding: '10px' }} />
      </div>
    </div>
  );
}