from expenses import validar_despesa


def test_despesa_valida_nao_gera_erros():
    erros = validar_despesa(valor=50.0, descricao="Almoço")

    assert erros == []


def test_valor_zero_ou_negativo_gera_erro():
    erros = validar_despesa(valor=0, descricao="Almoço")

    assert len(erros) == 1
    assert erros[0].campo == "valor"


def test_descricao_vazia_gera_erro():
    erros = validar_despesa(valor=50.0, descricao="   ")

    assert len(erros) == 1
    assert erros[0].campo == "descricao"


def test_valor_e_descricao_invalidos_geram_dois_erros():
    erros = validar_despesa(valor=-10, descricao="")

    assert len(erros) == 2
