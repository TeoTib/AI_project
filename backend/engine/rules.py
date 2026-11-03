import random

class RuleEngine:
    @staticmethod
    def apply_rule(cell_state: int, neighbors_counts: dict, rules_def: dict) -> int:
        transitions = rules_def.get("transitions", [])
        
        for trans in transitions:
            # Sărim dacă regula nu se aplică stării curente
            if trans["from"] != cell_state:
                continue
                
            match = True
            
            # Verificăm condiția de probabilitate (dacă există)
            if "probability" in trans:
                if random.random() >= trans["probability"]:
                    match = False
            
            # Verificăm starea vecinilor (dacă există)
            if match and "neighbor_state" in trans:
                n_state = trans["neighbor_state"]
                n_count = neighbors_counts.get(str(n_state)) or neighbors_counts.get(n_state, 0)
                cond = trans.get("condition", "==")
                val = trans.get("count", 0)
                
                if cond == "==" and not (n_count == val): match = False
                elif cond == ">=" and not (n_count >= val): match = False
                elif cond == "<=" and not (n_count <= val): match = False
                elif cond == ">" and not (n_count > val): match = False
                elif cond == "<" and not (n_count < val): match = False
                
            if match:
                return trans["to"]
                
        return cell_state