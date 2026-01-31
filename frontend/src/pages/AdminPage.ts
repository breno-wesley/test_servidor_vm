import { createHeader } from '../components/Header';
import { store } from '../state/store';
import { api } from '../api/client';
import { router } from '../router/router';

export function createAdminPage(): HTMLElement {
  const page = document.createElement('div');
  
  // Check if user is admin
  if (!store.isAdmin()) {
    router.navigate('/home');
    return page;
  }

  const header = createHeader();
  page.appendChild(header);

  const main = document.createElement('main');
  main.className = 'main-content fade-in';

  const render = async () => {
    main.innerHTML = `
      <h1 class="page-title">⚙️ Painel Administrativo</h1>
      
      <div class="card" style="margin-bottom: 2rem;">
        <h2 style="margin-bottom: 1rem;">👥 Usuários Cadastrados</h2>
        <div data-users>
          <div class="loading">⏳ Carregando usuários...</div>
        </div>
      </div>

      <div class="card">
        <h2 style="margin-bottom: 1rem;">💰 Todas as Vendas</h2>
        <div data-sales>
          <div class="loading">⏳ Carregando vendas...</div>
        </div>
      </div>
    `;

    const usersContainer = main.querySelector('[data-users]');
    const salesContainer = main.querySelector('[data-sales]');

    // Load users
    try {
      const { users } = await api.getAllUsers();
      
      usersContainer!.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.is_admin ? '⚙️ Admin' : '👤 Usuário'}</td>
                <td>${user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      usersContainer!.innerHTML = '<div class="alert alert-error">Erro ao carregar usuários</div>';
    }

    // Load sales
    try {
      const { sales } = await api.getAllSales();
      
      if (sales.length === 0) {
        salesContainer!.innerHTML = '<div class="empty-state"><p>Nenhuma venda realizada ainda</p></div>';
        return;
      }

      salesContainer!.innerHTML = sales.map((sale: any) => `
        <div class="card" style="margin-bottom: 1rem; background: var(--bg-secondary);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
            <div>
              <strong>Venda #${sale.id}</strong>
              <div style="color: var(--text-muted); font-size: 0.9rem;">
                Cliente: ${sale.user_name} (${sale.user_email})
              </div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">
                ${new Date(sale.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
            <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-light);">
              R$ ${sale.total.toFixed(2)}
            </div>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
            ${sale.items.map((item: any) => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.quantity}x ${item.product_name}</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    } catch (error) {
      salesContainer!.innerHTML = '<div class="alert alert-error">Erro ao carregar vendas</div>';
    }
  };

  render();
  page.appendChild(main);

  return page;
}
