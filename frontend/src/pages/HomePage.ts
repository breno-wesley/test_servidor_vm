import { createHeader } from '../components/Header';
import { createProductCard } from '../components/ProductCard';
import { store } from '../state/store';
import { api } from '../api/client';

export function createHomePage(): HTMLElement {
  const page = document.createElement('div');
  
  const header = createHeader();
  page.appendChild(header);

  const main = document.createElement('main');
  main.className = 'main-content fade-in';

  const render = async () => {
    if (store.products.length === 0) {
      main.innerHTML = '<div class="loading">⏳ Carregando produtos...</div>';
      
      try {
        const { products } = await api.getProducts();
        store.setProducts(products);
      } catch (error) {
        main.innerHTML = '<div class="alert alert-error">Erro ao carregar produtos</div>';
        return;
      }
    }

    main.innerHTML = `
      <h1 class="page-title">🏠 Produtos Disponíveis</h1>
      <div class="product-grid"></div>
    `;

    const grid = main.querySelector('.product-grid');
    if (grid) {
      store.products.forEach(product => {
        grid.appendChild(createProductCard(product));
      });
    }
  };

  render();
  page.appendChild(main);

  return page;
}
