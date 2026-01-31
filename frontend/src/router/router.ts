type RouteHandler = () => HTMLElement;

interface Route {
  path: string;
  handler: RouteHandler;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

class Router {
  private routes: Route[] = [];
  private currentPath = '';

  register(path: string, handler: RouteHandler, options: { requiresAuth?: boolean; requiresAdmin?: boolean } = {}) {
    this.routes.push({ path, handler, ...options });
  }

  navigate(path: string) {
    this.currentPath = path;
    window.history.pushState({}, '', path);
    this.render();
  }

  private render() {
    const route = this.routes.find(r => r.path === this.currentPath) || this.routes[0];
    
    if (!route) {
      console.error('No route found');
      return;
    }

    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '';
      app.appendChild(route.handler());
    }
  }

  init() {
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.render();
    });

    // Set initial path
    this.currentPath = window.location.pathname;
    if (this.currentPath === '/') {
      this.currentPath = '/home';
    }
    this.render();
  }

  getCurrentPath(): string {
    return this.currentPath;
  }
}

export const router = new Router();
