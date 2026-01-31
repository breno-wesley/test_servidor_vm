import { createHeader } from '../components/Header';
import { store } from '../state/store';
import { api } from '../api/client';
import { Sale } from '../api/client';

export function createProfilePage(): HTMLElement {
  const page = document.createElement('div');
  
  const header = createHeader();
  page.appendChild(header);

  const main = document.createElement('main');
  main.className = 'main-content fade-in';

  const render = async () => {
    main.innerHTML = `
      <h1 class="page-title">👤 Meu Perfil</h1>
      
      <div class="card" style="margin-bottom: 2rem;">
        <h2 style="margin-bottom: 1rem;">Informações Pessoais</h2>
        <p><strong>Nome:</strong> ${store.user?.name}</p>
        <p><strong>Email:</strong> ${store.user?.email}</p>
        <p><strong>Tipo:</strong> ${store.isAdmin() ? '⚙️ Administrador' : '👤 Usuário'}</p>
      </div>

      <div class="card">
        <h2 style="margin-bottom: 1rem;">📦 Histórico de Pedidos</h2>
        <div data-orders>
          <div class="loading">⏳ Carregando pedidos...</div>
        </div>
      </div>
    `;

    const ordersContainer = main.querySelector('[data-orders]');
    
    try {
      const { orders } = await api.getUserOrders();
      
      if (orders.length === 0) {
        ordersContainer!.innerHTML = `
          <div class="empty-state">
            <p>Você ainda não fez nenhum pedido</p>
          </div>
        `;
        return;
      }

      ordersContainer!.innerHTML = orders.map((order: Sale) => `
        <div class="card" style="margin-bottom: 1rem; background: var(--bg-secondary);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
            <div>
              <strong>Pedido #${order.id}</strong>
              <div style="color: var(--text-muted); font-size: 0.9rem;">
                ${new Date(order.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
            <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-light);">
              R$ ${order.total.toFixed(2)}
            </div>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.quantity}x ${item.product_name}</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    } catch (error) {
      ordersContainer!.innerHTML = '<div class="alert alert-error">Erro ao carregar pedidos</div>';
    }
  };

  render();
  page.appendChild(main);

  return page;
}
