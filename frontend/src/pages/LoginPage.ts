import { api } from '../api/client';
import { store } from '../state/store';
import { router } from '../router/router';

export function createLoginPage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'login-container fade-in';

  let isLogin = true;

  const render = () => {
    container.innerHTML = `
      <div class="login-card">
        <h1 class="login-title">💊 Farmácia Popular</h1>
        
        <div class="login-tabs">
          <button class="login-tab ${isLogin ? 'active' : ''}" data-tab="login">
            Entrar
          </button>
          <button class="login-tab ${!isLogin ? 'active' : ''}" data-tab="register">
            Cadastrar
          </button>
        </div>

        <form data-form>
          ${!isLogin ? `
            <div class="form-group">
              <label class="form-label">Nome</label>
              <input type="text" name="name" class="form-input" required />
            </div>
          ` : ''}
          
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" name="email" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" name="password" class="form-input" required />
          </div>

          <div data-error style="display: none;" class="alert alert-error"></div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
            ${isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>
    `;

    // Tab switching
    container.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        isLogin = (tab as HTMLElement).dataset.tab === 'login';
        render();
      });
    });

    // Form submission
    const form = container.querySelector('[data-form]') as HTMLFormElement;
    const errorDiv = container.querySelector('[data-error]') as HTMLElement;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';

      const formData = new FormData(form);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const name = formData.get('name') as string;

      try {
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Processando...';

        let result;
        if (isLogin) {
          result = await api.login(email, password);
        } else {
          result = await api.register(email, password, name);
        }

        store.setUser(result.user);
        
        // Load cart
        try {
          const { cart } = await api.getCart();
          store.setCart(cart);
        } catch (err) {
          console.error('Error loading cart:', err);
        }

        router.navigate('/home');
      } catch (error: any) {
        errorDiv.textContent = error.message || 'Erro ao processar requisição';
        errorDiv.style.display = 'block';
        
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = isLogin ? 'Entrar' : 'Cadastrar';
      }
    });
  };

  render();
  return container;
}
