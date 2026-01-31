import { createHeader } from '../components/Header';
import { createCartItem } from '../components/CartItem';
import { store } from '../state/store';
import { api } from '../api/client';
import { router } from '../router/router';

export function createCartPage(): HTMLElement {
  const page = document.createElement('div');
  
  const header = createHeader();
  page.appendChild(header);

  const main = document.createElement('main');
  main.className = 'main-content fade-in';

  const render = () => {
    if (!store.cart || store.cart.items.length === 0) {
      main.innerHTML = `
        <h1 class="page-title">🛒 Carrinho</h1>
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione produtos para começar suas compras</p>
          <button class="btn btn-primary" data-go-home style="margin-top: 1rem;">
            Ver Produtos
          </button>
        </div>
      `;

      const goHomeBtn = main.querySelector('[data-go-home]');
      goHomeBtn?.addEventListener('click', () => router.navigate('/home'));
      
      return;
    }

    main.innerHTML = `
      <h1 class="page-title">🛒 Carrinho</h1>
      <div class="cart-items"></div>
      <div class="cart-summary">
        <div class="cart-total">
          <span>Total:</span>
          <span class="cart-total-value">R$ ${store.cart.total.toFixed(2)}</span>
        </div>
        <button class="btn btn-primary" data-checkout style="width: 100%;">
          ✓ Finalizar Compra
        </button>
      </div>
    `;

    const itemsContainer = main.querySelector('.cart-items');
    if (itemsContainer) {
      store.cart.items.forEach(item => {
        itemsContainer.appendChild(createCartItem(item));
      });
    }

    const checkoutBtn = main.querySelector('[data-checkout]');
    checkoutBtn?.addEventListener('click', async () => {
      try {
        (checkoutBtn as HTMLButtonElement).disabled = true;
        checkoutBtn.textContent = '⏳ Processando...';

        await api.checkout();
        
        // Reload cart and products
        const { cart } = await api.getCart();
        store.setCart(cart);
        
        const { products } = await api.getProducts();
        store.setProducts(products);

        alert('✓ Compra finalizada com sucesso!');
        router.navigate('/profile');
      } catch (error: any) {
        alert(error.message || 'Erro ao finalizar compra');
        (checkoutBtn as HTMLButtonElement).disabled = false;
        checkoutBtn.textContent = '✓ Finalizar Compra';
      }
    });
  };

  render();
  store.subscribe(render);
  page.appendChild(main);

  return page;
}
