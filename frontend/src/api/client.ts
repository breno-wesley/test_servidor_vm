const API_BASE_URL = 'http://localhost:3000/api';

export interface User {
  id: number;
  email: string;
  name: string;
  is_admin: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  stock: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface Sale {
  id: number;
  total: number;
  created_at: string;
  items: {
    product_name: string;
    quantity: number;
    price: number;
  }[];
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  // Products
  async getProducts() {
    return this.request<{ products: Product[] }>('/products');
  }

  async getProduct(id: number) {
    return this.request<{ product: Product }>(`/products/${id}`);
  }

  // Cart
  async getCart() {
    return this.request<{ cart: Cart }>('/cart');
  }

  async addToCart(productId: number, quantity: number = 1) {
    return this.request<{ message: string }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request<{ message: string }>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: number) {
    return this.request<{ message: string }>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async checkout() {
    return this.request<{ message: string; sale: any }>('/cart/checkout', {
      method: 'POST',
    });
  }

  // User
  async getUserOrders() {
    return this.request<{ orders: Sale[] }>('/user/orders');
  }

  // Admin
  async getAllUsers() {
    return this.request<{ users: User[] }>('/admin/users');
  }

  async getAllSales() {
    return this.request<{ sales: Sale[] }>('/admin/sales');
  }
}

export const api = new ApiClient();
