export const dictOperatorsMock = [
        {
            "code": "eq",
            "label": "Igual (=)",
            "type": ["number", "bool"]
        },
        {
            "code": "neq",
            "label": "No igual (!=)",
            "type": ["number", "bool"]
        },
        {
            "code": "gt",
            "label": "Mayor que (>)",
            "type": ["number", "date"]
        },
        {
            "code": "lt",
            "label": "Menor que (<)",
            "type": ["number", "date"]
        },
        {
            "code": "gte",
            "label": "Mayor o igual (>=)",
            "type": ["number", "date"]
        },
        {
            "code": "lte",
            "label": "Menor o igual (<=)",
            "type": ["number", "date"]
        },
        {
            "code": "like",
            "label": "Contiene (texto)",
            "type": ["string"]
        },
        {
            "code": "ilike",
            "label": "Contiene (texto, ignora mayusculas)",
            "type": ["string"]
        },
        {
            "code": "in",
            "label": "Lista de opciones",
            "type": ["string"]
        },
        {
            "code": "between",
            "label": "Entres dos valores (rangos)",
            "type": ["number", "date"]
        }
    ]