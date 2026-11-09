# Contrato inicial de KPIs — antes do tratamento

## Objetivo
Avaliar vendas de uma operação fictícia de produtos de informática: evolução do valor vendido, volume, comportamento de compra e desempenho por canal, produto, marca, vendedor e estado do cliente.

Fluxo desta etapa: geração sintética em Python → CSV → PostgreSQL/raw. O perfilamento e tratamento serão feitos em M/Power Query no Power BI; as medidas analíticas serão implementadas em DAX posteriormente. Não há transformação analítica SQL nem análise Python nesta etapa.

## Indicadores comerciais

| KPI | Definição de negócio | Grão e observações |
|---|---|---|
| Valor de vendas registrado (R$) | Soma de valor_total_item dos itens vinculados às vendas do período | Item; usar o preço histórico do item, nunca o preço atual do catálogo. Não representa receita contábil, pois não há status de pagamento, cancelamento ou devolução. |
| Pedidos registrados | Quantidade distinta de id_venda em vendas | Pedido; inclui os pedidos sem itens e deve ser identificado assim no relatório. |
| Pedidos com itens | Quantidade distinta de id_venda que tenha pelo menos um item | Pedido; denominador do ticket médio. Não chamar de pedidos pagos/concluídos. |
| Ticket médio (R$) | Valor de vendas registrado ÷ pedidos com itens | Usar a mesma população e o mesmo filtro temporal no numerador e denominador. Sem pedidos, retornar vazio. |
| Unidades vendidas registradas | Soma de quantidade nos itens vinculados às vendas | Unidade; não confundir com número de linhas da tabela de itens. |
| Clientes compradores | Clientes distintos com pelo menos um pedido com itens no período | Cliente; não equivale ao total de clientes cadastrados. |
| Frequência de compra | Pedidos com itens ÷ clientes compradores no período | Pedidos por cliente comprador; retornar vazio quando não houver compradores. |
| Taxa de compradores recorrentes (%) | Clientes com dois ou mais pedidos com itens no período ÷ clientes compradores no mesmo período | Cliente; recorrência dentro da janela selecionada. Não representa retenção por coorte. |
| Crescimento mensal do valor vendido (%) | Valor do mês ÷ valor do mês anterior − 1 | Comparar meses completos; base anterior zero/ausente retorna vazio. Mês parcial fica identificado e fora da comparação padrão. |
| Participação no valor vendido (%) | Valor do segmento ÷ valor total sob os demais filtros | Canal, produto, marca, vendedor ou estado; remover somente o filtro da dimensão comparada no denominador. |

## Indicadores de qualidade, sem corrigir os dados agora

| Indicador | Definição |
|---|---|
| Pedidos sem itens (%) | Pedidos sem correspondência na tabela de itens ÷ pedidos registrados |
| Vendas anteriores ao cadastro (%) | Pedidos cuja data_venda seja anterior à data_cadastro do cliente ÷ pedidos com cliente correspondente e ambas as datas interpretáveis |
| Clientes sem e-mail (%) | Clientes com e-mail nulo, vazio ou só espaços ÷ clientes cadastrados no contexto de clientes |
| Duplicidade de chave | Linhas excedentes por chave de cada tabela; reportar separadamente por tabela |
| Referências sem correspondência | Contar referências ausentes entre vendas/clientes, vendas/vendedores, itens/vendas e itens/produtos |

Domínio artificial de e-mail não comprova invalidade técnica nem falta de entrega. A classificação do gerador deve ser descrita como sintética.

## Regras a aplicar após o perfilamento

- Eixo temporal comercial: data_venda, com calendário contínuo. Para clientes cadastrados, usar data_cadastro e contexto próprio.
- Estado comercial: estado do cliente; estado do vendedor e filial serão atributos distintos.
- Preço e valores monetários em BRL; totais arredondados para duas casas na apresentação.
- Base bruta preservada no PostgreSQL; não apagar pedidos sem itens ou datas inconsistentes nesta etapa.
- Antes de publicar resultados, registrar em Power Query as regras adotadas para datas impossíveis, duplicatas, chaves sem correspondência e erros de conversão. Exibir os efeitos das exclusões e as populações de cálculo.
- Não excluir vendedores por sua situação atual: ela não informa se o vendedor estava ativo na data histórica da venda.
- Não classificar vendas anteriores ao cadastro como válidas ou inválidas automaticamente antes de investigar o significado dos campos.

## Fora do escopo atual

Lucro/margem (não há custo), conversão de visitantes (não há tráfego), CAC/ROAS (não há investimento), inadimplência (não há pagamentos), metas (não há orçamento) e retenção por coorte (exige definição adicional).

## Limites da simulação

10.185 clientes, 450 SKUs (15 tipos × 10 modelos × 3 marcas), 13 vendedores, 10.357 vendas e 25.463 itens. Números não redondos aumentam a variedade de volume, mas a geração continua sintética e majoritariamente aleatória: não afirmar sazonalidade, causalidade ou representatividade de um mercado real. Nomes, datas e valores são reproduzíveis com sementes fixas e as dependências versionadas.

## Próxima etapa autorizada em momento posterior

Conectar o Power BI ao PostgreSQL, perfilar os dados no Power Query e decidir os tratamentos. Não construir visuais nem implementar as medidas nesta entrega.
