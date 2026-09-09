import sys
from pathlib import Path

# Permite importar os módulos de backend/src diretamente nos testes
# (ex.: `from expenses import validar_despesa`) sem precisar empacotar
# o backend ainda.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
