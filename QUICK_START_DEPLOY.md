# 🚀 Quick Start - Deploy com PM2 e Nginx

## Opção 1: Deploy Automático (Recomendado)

Execute o script de deploy como **Administrador**:

```powershell
# No PowerShell como Administrador
.\deploy.ps1
```

Este script irá:
- ✅ Parar servidores de desenvolvimento
- ✅ Compilar backend e frontend
- ✅ Instalar PM2 (se necessário)
- ✅ Iniciar backend com PM2

## Opção 2: Deploy Manual

### Passo 1: Compilar

```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

### Passo 2: PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
cd backend
pm2 start ecosystem.config.js
pm2 save
```

### Passo 3: Nginx

1. **Instalar Nginx**:
   ```powershell
   choco install nginx -y
   ```

2. **Configurar**: Copie `nginx.conf` para `C:\nginx\conf\nginx.conf`

3. **Iniciar**:
   ```powershell
   cd C:\nginx
   start nginx
   ```

## Acessar Aplicação

- **URL**: http://localhost
- **Login**: admin@pharmacy.com / admin123

## Comandos Úteis

```bash
# PM2
pm2 status          # Ver status
pm2 logs            # Ver logs
pm2 restart all     # Reiniciar
pm2 stop all        # Parar

# Nginx
nginx -t            # Testar config
nginx -s reload     # Recarregar
nginx -s stop       # Parar
```

## Documentação Completa

Ver `DEPLOY_GUIDE.md` para instruções detalhadas.
