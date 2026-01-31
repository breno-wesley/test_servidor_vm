import { router } from './router/router';
import { store } from './state/store';
import { api } from './api/client';
import { createLoginPage } from './pages/LoginPage';
import { createHomePage } from './pages/HomePage';
import { createCartPage } from './pages/CartPage';
import { createProfilePage } from './pages/ProfilePage';
import { createAdminPage } from './pages/AdminPage';

// Register routes
router.register('/login', createLoginPage);
router.register('/home', createHomePage);
router.register('/cart', createCartPage);
router.register('/profile', createProfilePage);
router.register('/admin', createAdminPage);

// Initialize app
async function init() {
  try {
    // Try to get current user
    const { user } = await api.getCurrentUser();
    store.setUser(user);
    
    // Load cart
    const { cart } = await api.getCart();
    store.setCart(cart);
    
    // If on login page, redirect to home
    if (window.location.pathname === '/login' || window.location.pathname === '/') {
      router.navigate('/home');
    } else {
      router.init();
    }
  } catch (error) {
    // Not authenticated, go to login
    router.navigate('/login');
    router.init();
  }
}

init();
