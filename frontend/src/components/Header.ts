import { store } from '../state/store';
import { router } from '../router/router';
import { api } from '../api/client';

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'header';

  const render = () => {
    const isLoggedIn = !!store.user;
    const cartCount = store.getCartItemCount();
    const isAdmin = store.isAdmin();
    const currentPath = router.getCurrentPath();

    header.innerHTML = `
      <div class="header-content">
        <div class="logo" data-nav="/">
          💊 Farmácia Popular
        </div>
        ${isLoggedIn ? `
          <nav class="nav">
            <a href="#" class="nav-link ${currentPath === '/home' ? 'active' : ''}" data-nav="/home">
              🏠 Início
            </a>
            <a href="#" class="nav-link ${currentPath === '/cart' ? 'active' : ''}" data-nav="/cart" style="position: relative;">
              🛒 Carrinho
              ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
            </a>
            <a href="#" class="nav-link ${currentPath === '/profile' ? 'active' : ''}" data-nav="/profile">
              👤 Perfil
            </a>
            ${isAdmin ? `
              <a href="#" class="nav-link ${currentPath === '/admin' ? 'active' : ''}" data-nav="/admin">
                ⚙️ Admin
              </a>
            ` : ''}
            <span class="nav-link" style="cursor: default;">
              Olá, ${store.user?.name}
            </span>
            <button class="btn btn-secondary btn-sm" data-logout>
              Sair
            </button>
          </nav>
        ` : `
          <nav class="nav">
            <a href="#" class="nav-link" data-nav="/login">
              Entrar
            </a>
          </nav>
        `}
      </div>
    `;

    // Add event listeners
    header.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = (e.currentTarget as HTMLElement).getAttribute('data-nav');
        if (path) router.navigate(path);
      });
    });

    const logoutBtn = header.querySelector('[data-logout]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await api.logout();
          store.setUser(null);
          store.setCart(null);
          router.navigate('/login');
        } catch (error) {
          console.error('Logout error:', error);
        }
      });
    }
  };

  render();
  store.subscribe(render);

  return header;
}
