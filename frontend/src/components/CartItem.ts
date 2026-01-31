import { CartItem } from '../api/client';
import { api } from '../api/client';
import { store } from '../state/store';

export function createCartItem(item: CartItem): HTMLElement {
  const cartItem = document.createElement('div');
  cartItem.className = 'cart-item fade-in';

  cartItem.innerHTML = `
    <img src="${item.image_url}" alt="${item.name}" class="cart-item-image" />
    <div class="cart-item-info">
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-price">R$ ${item.price.toFixed(2)} cada</div>
      <div style="color: var(--text-muted); font-size: 0.9rem;">
        Subtotal: R$ ${item.subtotal.toFixed(2)}
      </div>
    </div>
    <div class="cart-item-controls">
      <div class="quantity-control">
        <button class="quantity-btn" data-decrease="${item.id}">-</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" data-increase="${item.id}" ${item.quantity >= item.stock ? 'disabled' : ''}>+</button>
      </div>
      <button class="btn btn-danger btn-sm" data-remove="${item.id}">
        🗑️ Remover
      </button>
    </div>
  `;

  // Decrease quantity
  const decreaseBtn = cartItem.querySelector(`[data-decrease="${item.id}"]`);
  decreaseBtn?.addEventListener('click', async () => {
    try {
      if (item.quantity > 1) {
        await api.updateCartItem(item.id, item.quantity - 1);
      } else {
        await api.removeCartItem(item.id);
      }
      const { cart } = await api.getCart();
      store.setCart(cart);
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar carrinho');
    }
  });

  // Increase quantity
  const increaseBtn = cartItem.querySelector(`[data-increase="${item.id}"]`);
  increaseBtn?.addEventListener('click', async () => {
    try {
      await api.updateCartItem(item.id, item.quantity + 1);
      const { cart } = await api.getCart();
      store.setCart(cart);
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar carrinho');
    }
  });

  // Remove item
  const removeBtn = cartItem.querySelector(`[data-remove="${item.id}"]`);
  removeBtn?.addEventListener('click', async () => {
    try {
      await api.removeCartItem(item.id);
      const { cart } = await api.getCart();
      store.setCart(cart);
    } catch (error: any) {
      alert(error.message || 'Erro ao remover item');
    }
  });

  return cartItem;
}
