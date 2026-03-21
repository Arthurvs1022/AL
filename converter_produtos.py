import csv
import json
import os

# 📂 Caminho do CSV (coloque o nome atualizado sempre)
CSV_FILE = "PRODUTO_202603182100.csv"

# 📄 Caminho direto do seu projeto
OUTPUT_FILE = "js/products.js"  # <-- IMPORTANTE

CATEGORY_MAP = {
    "1": "DIVERSOS",
    "2": "ELETRICA/ACESSORIOS",
    "3": "HIDRAULICA/TUBOS/CONEXOES",
    "4": "FERRAMENTAS MANUAIS",
    "5": "MAQUINAS/EQUIPAMENTOS ELETRICOS",
    "6": "IMPERM/SELANTES/ADITIVOS",
    "7": "CIMENTOS/ARGAMASSAS",
    "8": "FIXADORES",
    "9": "ESGOTO",
    "10": "TINTAS",
    "11": "LOUÇAS/METAIS",
    "12": "EPI",
    "14": "FERRAGENS",
    "15": "JARDIM/LIMPEZA",
    "16": "LUBRIFICANTES",
    "17": "REPAROS",
    "18": "ACESSORIOS",
    "19": "MAT. OBRA",
    "21": "ILUMINAÇÃO",
    "23": "PISCINA",
    "26": "PISCINA",
    "31": "FIOS/CABOS",
    "32": "TINTAS",
    "37": "MATERIAL ELETRICO",
    "38": "TOMADAS",
    "44": "HIDRAULICO",
    "47": "REDE",
    "48": "BOMBAS",
    "49": "TORNEIRAS",
    "50": "FERRAMENTAS ELETRICAS",
    "55": "DIVERSOS",
    "58": "SOLVENTES"
}

products = []

with open(CSV_FILE, newline='', encoding='latin-1') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        try:
            product = {
                "id": str(row.get("ID", "")).strip(),
                "name": str(row.get("NAME", "")).strip(),
                "category": CATEGORY_MAP.get(str(row.get("CATEGORY")), "OUTROS"),
                "price": float(row.get("PRICE", 0) or 0),
                "unit": str(row.get("UNIT", "")).strip(),
                "desc": ""
            }

            if product["name"] and product["price"] > 0:
                products.append(product)

        except Exception as e:
            print("Erro:", e)

# 📁 Garante que pasta existe
os.makedirs("js", exist_ok=True)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("window.PRODUCTS = ")
    json.dump(products, f, ensure_ascii=False, indent=2)

print("\n✅ products.js atualizado com sucesso!")
print(f"📦 Total de produtos: {len(products)}")