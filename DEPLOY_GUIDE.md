# 🚀 Deploy com PM2 e Nginx - Guia Completo

## 📋 Pré-requisitos

Você precisará instalar:
- **PM2**: Gerenciador de processos Node.js
- **Nginx**: Servidor web e reverse proxy

## 1️⃣ Instalar PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
pm2 --version
```

## 2️⃣ Configurar Backend com PM2

### Criar arquivo de configuração PM2

Crie o arquivo `ecosystem.config.js` na raiz do projeto backend:

```javascript
module.exports = {
  apps: [{
    name: 'pharmacy-api',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Compilar e iniciar o backend

```bash
cd backend

# Compilar TypeScript para JavaScript
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs
pm2 logs pharmacy-api

# Salvar configuração para reiniciar automaticamente
pm2 save
pm2 startup
```

## 3️⃣ Build do Frontend

```bash
cd frontend

# Fazer build de produção
npm run build

# Isso criará a pasta 'dist' com os arquivos estáticos
```

## 4️⃣ Instalar e Configurar Nginx

### No Windows (usando Chocolatey)

```powershell
# Instalar Chocolatey (se não tiver)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Nginx
choco install nginx -y
```

### Ou baixar manualmente

Baixe de: http://nginx.org/en/download.html

## 5️⃣ Configurar Nginx

### Arquivo de configuração: `nginx.conf`

Localize o arquivo `nginx.conf` (geralmente em `C:\nginx\conf\nginx.conf` ou `/etc/nginx/nginx.conf`)

Substitua ou adicione esta configuração:

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    # Configuração do servidor
    server {
        listen       80;
        server_name  localhost;

        # Frontend - Servir arquivos estáticos
        location / {
            root   C:/Users/breno/Desktop/Alpha EdTech/HardSkills/MiniDesafio_API_FarmaciaPopular/test_servidor_vm/frontend/dist;
            index  index.html;
            try_files $uri $uri/ /index.html;
        }

        # Backend API - Reverse Proxy
        location /api {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Configuração de erro
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

**⚠️ IMPORTANTE**: Ajuste o caminho `root` para o caminho absoluto correto da pasta `dist` do seu frontend.

## 6️⃣ Iniciar Nginx

### No Windows

```powershell
# Navegar até a pasta do Nginx
cd C:\nginx

# Iniciar Nginx
start nginx

# Ou
nginx.exe

# Verificar se está rodando
nginx -t

# Recarregar configuração
nginx -s reload

# Parar Nginx
nginx -s stop
```

### No Linux/Mac

```bash
# Iniciar
sudo systemctl start nginx

# Verificar status
sudo systemctl status nginx

# Recarregar configuração
sudo nginx -s reload

# Parar
sudo systemctl stop nginx
```

## 7️⃣ Estrutura Final

```
Nginx (porta 80)
├── / → Frontend (arquivos estáticos da pasta dist)
└── /api → Backend (proxy para localhost:3000)
    └── PM2 → Node.js API (porta 3000)
```

## 8️⃣ Comandos Úteis PM2

```bash
# Ver processos
pm2 list

# Ver logs em tempo real
pm2 logs

# Reiniciar aplicação
pm2 restart pharmacy-api

# Parar aplicação
pm2 stop pharmacy-api

# Deletar do PM2
pm2 delete pharmacy-api

# Monitoramento
pm2 monit

# Salvar configuração atual
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

## 9️⃣ Testar a Aplicação

Depois de tudo configurado:

1. **Acesse**: http://localhost
2. **Login**: admin@pharmacy.com / admin123
3. **API**: http://localhost/api/health

## 🔧 Troubleshooting

### Backend não inicia com PM2

```bash
# Ver logs de erro
pm2 logs pharmacy-api --err

# Verificar se compilou corretamente
cd backend
npm run build
ls dist/
```

### Nginx não encontra arquivos

- Verifique o caminho absoluto no `nginx.conf`
- Certifique-se que rodou `npm run build` no frontend
- Verifique se a pasta `dist` existe

### Erro de permissão no Nginx (Windows)

Execute o PowerShell como Administrador

### Porta 80 já em uso

Mude a porta no `nginx.conf`:
```nginx
listen 8080;  # ou outra porta disponível
```

## 📝 Checklist de Deploy

- [ ] PM2 instalado globalmente
- [ ] Backend compilado (`npm run build`)
- [ ] Backend rodando no PM2
- [ ] Frontend compilado (`npm run build`)
- [ ] Nginx instalado
- [ ] `nginx.conf` configurado com caminhos corretos
- [ ] Nginx iniciado
- [ ] Testar http://localhost
- [ ] Testar http://localhost/api/health

## 🎯 Próximos Passos (Opcional)

- Configurar domínio customizado
- Adicionar SSL/HTTPS com Let's Encrypt
- Configurar firewall
- Monitoramento com PM2 Plus
- Backup automático do banco de dados
