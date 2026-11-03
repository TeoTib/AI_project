# backend/engine/grid.py
from .rules import RuleEngine
import copy

class Grid:
    def __init__(self, matrix):
        self.matrix = matrix
        self.rows = len(matrix)
        self.cols = len(matrix[0]) if self.rows > 0 else 0

    def get_neighbors(self, r, c, neighborhood_type="moore"):
        counts = {}
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue
                nr = (r + dr) % self.rows
                nc = (c + dc) % self.cols
                val = self.matrix[nr][nc]
                counts[val] = counts.get(val, 0) + 1
        return counts

    def next_state(self, rules_def: dict):
        new_matrix = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        for r in range(self.rows):
            for c in range(self.cols):
                neighbors = self.get_neighbors(r, c)
                current_state = self.matrix[r][c]
                new_matrix[r][c] = RuleEngine.apply_rule(current_state, neighbors, rules_def)
        self.matrix = new_matrix
        return self.matrix

    def simulate(self, rules_def: dict, steps: int, store_intermediate: bool):
        history = []
        if store_intermediate:
            history.append(copy.deepcopy(self.matrix))

        for _ in range(steps):
            self.next_state(rules_def)
            if store_intermediate:
                history.append(copy.deepcopy(self.matrix))
        
        return self.matrix, history