"""Ponto de entrada da API.

PUT /despesas/{id} e DELETE /despesas/{id} ainda não estão aqui
"""

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db
from expenses import validar_despesa

# Cria as tabelas se ainda não existirem para rodar localmente sem
# depender do Alembic
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Gestão de Despesas - API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/despesas", response_model=list[schemas.DespesaOut])
def listar_despesas(db: Session = Depends(get_db)) -> list[models.Despesa]:
    """Lista as despesas cadastradas, das mais recentes para as mais antigas."""
    stmt = select(models.Despesa).order_by(models.Despesa.data.desc())
    return db.execute(stmt).scalars().all()


@app.post(
    "/despesas",
    response_model=schemas.DespesaOut,
    status_code=status.HTTP_201_CREATED,
)
def criar_despesa(
    despesa: schemas.DespesaCreate, db: Session = Depends(get_db)
) -> models.Despesa:
    """Cadastra uma nova despesa, reaproveitando as regras de expenses.py."""
    erros = validar_despesa(despesa.valor, despesa.descricao)
    if erros:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=[{"campo": e.campo, "mensagem": e.mensagem} for e in erros],
        )

    nova_despesa = models.Despesa(**despesa.model_dump())
    db.add(nova_despesa)
    db.commit()
    db.refresh(nova_despesa)
    return nova_despesa


@app.put("/despesas/{despesa_id}", response_model=schemas.DespesaOut)
def atualizar_despesa(
    despesa_id: int, despesa: schemas.DespesaUpdate, db: Session = Depends(get_db)
) -> models.Despesa:
    """Atualiza uma despesa existente (substitui todos os campos)."""
    despesa_existente = db.get(models.Despesa, despesa_id)
    if despesa_existente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Despesa {despesa_id} não encontrada.",
        )
 
    erros = validar_despesa(despesa.valor, despesa.descricao)
    if erros:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=[{"campo": e.campo, "mensagem": e.mensagem} for e in erros],
        )
 
    for campo, valor in despesa.model_dump().items():
        setattr(despesa_existente, campo, valor)
 
    db.commit()
    db.refresh(despesa_existente)
    return despesa_existente


@app.delete("/despesas/{despesa_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_despesa(despesa_id: int, db: Session = Depends(get_db)) -> None:
    """Remove uma despesa pelo id."""
    despesa_existente = db.get(models.Despesa, despesa_id)
    if despesa_existente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Despesa {despesa_id} não encontrada.",
        )
 
    db.delete(despesa_existente)
    db.commit()
