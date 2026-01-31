import { Product } from '../api/client';
import { api } from '../api/client';
import { store } from '../state/store';

export function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('div');
  card.className = 'product-card fade-in';

  card.innerHTML = `
    <img src="${product.image_url}" alt="${product.name}" class="product-image" />
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="product-footer">
        <div>
          <div class="product-price">R$ ${product.price.toFixed(2)}</div>
          <div class="product-stock">
            ${product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
          </div>
        </div>
        <button 
          class="btn btn-primary btn-sm" 
          ${product.stock === 0 ? 'disabled' : ''}
          data-add-to-cart="${product.id}"
        >
          ${product.stock > 0 ? '🛒 Adicionar' : 'Indisponível'}
        </button>
      </div>
    </div>
  `;

  const addButton = card.querySelector('[data-add-to-cart]');
  if (addButton) {
    addButton.addEventListener('click', async () => {
      try {
        addButton.textContent = '⏳ Adicionando...';
        addButton.setAttribute('disabled', 'true');
        
        await api.addToCart(product.id);
        const { cart } = await api.getCart();
        store.setCart(cart);
        
        addButton.textContent = '✓ Adicionado!';
        setTimeout(() => {
          addButton.textContent = '🛒 Adicionar';
          addButton.removeAttribute('disabled');
        }, 1500);
      } catch (error: any) {
        alert(error.message || 'Erro ao adicionar ao carrinho');
        addButton.textContent = '🛒 Adicionar';
        addButton.removeAttribute('disabled');
      }
    });
  }

  return card;
}
