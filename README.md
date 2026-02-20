# AL ELÉTRICA, HIDRÁULICA & PARAFUSO — Delivery (MVP)

Site estático (HTML/CSS/JS) com:
- Catálogo (busca + categoria)
- Carrinho com localStorage
- Taxa de entrega por bairro
- Checkout via WhatsApp (mensagem pronta)

## Editar produtos e frete
- `products.js`:
  - `window.PRODUCTS`
  - `window.DELIVERY_FEES`

## Rodar
- Abrir `index.html` no navegador, ou
- Live Server no VSCode.


## Imagens dos produtos

Você pode adicionar imagens para os itens do catálogo de duas formas:

1) **Por arquivo local**: crie a pasta `img/products/` e adicione as imagens com o **ID do produto** como nome do arquivo.
   - Ex: `img/products/610.jpg` ou `img/products/610.png`
   - O site tenta carregar primeiro `img/products/<ID>.jpg`. Se não existir, aparece um placeholder.

2) **Por campo `image` no products.js**: você pode acrescentar `"image": "https://..."` dentro do objeto do produto.

Dica: se você tiver fotos reais tiradas no armazém, isso aumenta muito a conversão.
