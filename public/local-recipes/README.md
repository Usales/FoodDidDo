# Receitas Locais - FoodDidDo

Esta pasta contém receitas locais personalizadas para o FoodDidDo.

## Como Adicionar uma Nova Receita Local

### 1. Adicione sua imagem
- Coloque a imagem da receita na pasta `images/`
- Use nomes descritivos (ex: `bolo-cenoura.jpg`)
- Formatos suportados: JPG, PNG, GIF, WebP
- Tamanho recomendado: 300x200px ou similar

### 2. Edite o arquivo `recipes.json`
Adicione um novo objeto ao array com as seguintes propriedades:

```json
{
  "id": "local-unico-id",
  "title": "Nome da Sua Receita",
  "image": "/local-recipes/images/sua-imagem.jpg",
  "instructions": "Instruções detalhadas de preparo...",
  "ingredient": "Ingrediente Principal",
  "category": "Categoria (ex: Prato Principal, Sobremesa, Salada)",
  "area": "Origem (ex: Brasil, Italiano, Mexicano)",
  "video": null,
  "source": "Receita Local",
  "ingredientsList": "Lista de ingredientes separados por vírgula",
  "relevanceScore": 100,
  "apiType": "local"
}
```

### 3. Propriedades Explicadas

- **id**: Identificador único (use "local-" + número)
- **title**: Nome da receita
- **image**: Caminho para a imagem (sempre comece com "/local-recipes/images/")
- **instructions**: Modo de preparo detalhado
- **ingredient**: Ingrediente principal da receita
- **category**: Categoria da receita
- **area**: Origem/região da receita
- **video**: Link para vídeo (null se não tiver)
- **source**: Sempre "Receita Local"
- **ingredientsList**: Lista de ingredientes
- **relevanceScore**: Score de relevância (100 para receitas locais)
- **apiType**: Sempre "local"

### 4. Exemplo Completo

```json
{
  "id": "local-2",
  "title": "Bolo de Cenoura da Vovó",
  "image": "/local-recipes/images/bolo-cenoura.jpg",
  "instructions": "1. Bata no liquidificador as cenouras, ovos e óleo. 2. Em uma tigela, misture a farinha, açúcar e fermento. 3. Adicione a mistura do liquidificador. 4. Asse em forno preaquecido a 180°C por 40 minutos.",
  "ingredient": "Cenoura",
  "category": "Sobremesa",
  "area": "Brasil",
  "video": null,
  "source": "Receita Local",
  "ingredientsList": "3 cenouras, 3 ovos, 1 xícara de óleo, 2 xícaras de farinha, 2 xícaras de açúcar, 1 colher de fermento",
  "relevanceScore": 100,
  "apiType": "local"
}
```

## Notas Importantes

- As receitas locais aparecerão automaticamente na busca
- Elas têm prioridade alta (relevanceScore: 100)
- Certifique-se de que o JSON está bem formatado
- Teste sempre após adicionar uma nova receita
