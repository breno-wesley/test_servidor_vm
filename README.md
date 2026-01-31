# Farmácia Popular - Full-Stack Application

Uma aplicação completa de farmácia com backend Node.js/TypeScript e frontend SPA em TypeScript.

## 🚀 Tecnologias

### Backend
- Node.js + TypeScript
- Express.js
- sqlite3 (banco de dados SQLite)
- bcrypt (criptografia de senhas)
- Autenticação com sessões e cookies

### Frontend
- TypeScript (SPA vanilla)
- Vite (dev server)
- CSS moderno com glassmorphism
- Componentização

## 📋 Pré-requisitos

- Node.js 18+ 
- npm 9+

## 🔧 Instalação

### Backend

```bash
cd backend
npm install
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 👤 Credenciais Padrão

**Administrador:**
- Email: `admin@pharmacy.com`
- Senha: `admin123`

## 📚 Funcionalidades

### Usuário
- ✅ Registro e login
- ✅ Visualizar produtos
- ✅ Adicionar produtos ao carrinho
- ✅ Gerenciar carrinho (quantidade, remover itens)
- ✅ Finalizar compra
- ✅ Visualizar histórico de pedidos
- ✅ Perfil do usuário

### Administrador
- ✅ Todas as funcionalidades de usuário
- ✅ Visualizar todos os usuários cadastrados
- ✅ Visualizar todas as vendas realizadas
- ✅ Detalhes de cada venda (produtos, quantidades, valores)

## 🗂️ Estrutura do Projeto

```
backend/
├── src/
│   ├── database/
│   │   ├── db.ts           # Conexão com SQLite
│   │   └── schema.ts       # Schema e seed data
│   ├── middleware/
│   │   └── auth.ts         # Autenticação
│   ├── routes/
│   │   ├── auth.routes.ts  # Rotas de autenticação
│   │   ├── products.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── user.routes.ts
│   │   └── admin.routes.ts
│   └── server.ts           # Servidor Express
└── package.json

frontend/
├── src/
│   ├── api/
│   │   └── client.ts       # Cliente API
│   ├── components/
│   │   ├── Header.ts
│   │   ├── ProductCard.ts
│   │   └── CartItem.ts
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── HomePage.ts
│   │   ├── CartPage.ts
│   │   ├── ProfilePage.ts
│   │   └── AdminPage.ts
│   ├── router/
│   │   └── router.ts       # Roteamento SPA
│   ├── state/
│   │   └── store.ts        # Gerenciamento de estado
│   └── main.ts             # Entry point
├── styles.css
├── index.html
└── package.json
```

## 🎨 Design

- Design moderno com dark theme
- Efeitos de glassmorphism
- Gradientes vibrantes
- Animações suaves
- Totalmente responsivo

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Sessões com cookies httpOnly
- Validação de estoque antes da compra
- Proteção de rotas admin
- CORS configurado

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Detalhes do produto

### Carrinho
- `GET /api/cart` - Ver carrinho
- `POST /api/cart/items` - Adicionar item
- `PUT /api/cart/items/:id` - Atualizar quantidade
- `DELETE /api/cart/items/:id` - Remover item
- `POST /api/cart/checkout` - Finalizar compra

### Usuário
- `GET /api/user/orders` - Histórico de pedidos

### Admin (requer admin)
- `GET /api/admin/users` - Listar usuários
- `GET /api/admin/sales` - Listar vendas

## 🐛 Troubleshooting

### Erro ao instalar dependências

Se encontrar erros ao executar `npm install`, tente:

```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Instalar novamente
npm install
```

### Porta já em uso

Se a porta 3000 (backend) ou 5173 (frontend) já estiver em uso, você pode:

1. Parar o processo que está usando a porta
2. Ou modificar a porta no código:
   - Backend: `src/server.ts` (linha com `const PORT`)
   - Frontend: criar arquivo `vite.config.ts` e configurar porta customizada

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.
