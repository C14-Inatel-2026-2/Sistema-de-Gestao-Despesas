"""Regras de negócio básicas para despesas.

Este módulo concentra validações que a API vai usar antes de gravar uma
despesa no banco. Fica separado do FastAPI para poder ser testado sem
precisar subir um servidor.
"""

from dataclasses import dataclass


@dataclass
class ErroValidacao:
    campo: str
    mensagem: str


def validar_despesa(valor: float, descricao: str) -> list[ErroValidacao]:
    """Valida os dados básicos de uma despesa.

    Retorna uma lista de erros encontrados. Lista vazia significa que a
    despesa é válida.
    """
    erros: list[ErroValidacao] = []

    if valor <= 0:
        erros.append(ErroValidacao("valor", "O valor da despesa deve ser maior que zero."))

    if not descricao or not descricao.strip():
        erros.append(ErroValidacao("descricao", "A descrição não pode ser vazia."))

    return erros
