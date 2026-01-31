import { User, Product, Cart } from '../api/client';

type Listener = () => void;

class Store {
  private listeners: Listener[] = [];
  
  public user: User | null = null;
  public products: Product[] = [];
  public cart: Cart | null = null;
  public isLoading = false;
  public error: string | null = null;

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }

  setUser(user: User | null) {
    this.user = user;
    this.notify();
  }

  setProducts(products: Product[]) {
    this.products = products;
    this.notify();
  }

  setCart(cart: Cart | null) {
    this.cart = cart;
    this.notify();
  }

  setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
    this.notify();
  }

  setError(error: string | null) {
    this.error = error;
    this.notify();
  }

  getCartItemCount(): number {
    return this.cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  isAdmin(): boolean {
    return this.user?.is_admin === 1;
  }
}

export const store = new Store();
