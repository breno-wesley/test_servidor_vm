# 🚀 Deploy na VM Ubuntu (VirtualBox) - Guia Completo

## 📋 Pré-requisitos na VM Ubuntu

### 1. Atualizar sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Node.js e npm

```bash
# Instalar Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### 4. Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl status nginx
```

## 📁 Transferir Arquivos para a VM

### Opção 1: SCP (do Windows para VM)

```powershell
# No PowerShell do Windows
scp -P 2222 -r "C:\Users\breno\Desktop\Alpha EdTech\HardSkills\MiniDesafio_API_FarmaciaPopular\test_servidor_vm" brenowes@localhost:~/
```

### Opção 2: Git (Recomendado)

Na VM Ubuntu:

```bash
cd ~
git clone <seu-repositorio>
# ou
# Criar repositório e fazer push do Windows, depois pull na VM
```

### Opção 3: Pasta Compartilhada VirtualBox

1. No VirtualBox: **Devices → Shared Folders → Shared Folders Settings**
2. Adicione a pasta do projeto
3. Na VM:
```bash
sudo mount -t vboxsf nome_da_pasta ~/projeto
```

## 🔨 Build e Deploy na VM Ubuntu

### 1. Navegar até o projeto

```bash
cd ~/test_servidor_vm
# ou o caminho onde você copiou os arquivos
```

### 2. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### 3. Build do Backend

```bash
cd backend
npm run build

# Verificar se compilou
ls dist/
```

### 4. Build do Frontend

```bash
cd ../frontend
npm run build

# Verificar se compilou
ls dist/
```

### 5. Iniciar Backend com PM2

```bash
cd ../backend

# Iniciar aplicação
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs
pm2 logs

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
# Execute o comando que o PM2 mostrar (começa com sudo)
```

### 6. Configurar Nginx

```bash
# Editar configuração do Nginx
sudo nano /etc/nginx/sites-available/pharmacy
```

Cole esta configuração:

```nginx
server {
    listen 80;
    server_name localhost;

    # Frontend - Servir arquivos estáticos
    location / {
        root /home/brenowes/test_servidor_vm/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache para assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs
    access_log /var/log/nginx/pharmacy_access.log;
    error_log /var/log/nginx/pharmacy_error.log;
}
```

**⚠️ IMPORTANTE**: Ajuste o caminho `root` para o caminho correto do seu projeto!

### 7. Ativar configuração do Nginx

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/pharmacy /etc/nginx/sites-enabled/

# Remover configuração padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

## 🌐 Acessar a Aplicação

### Da VM Ubuntu

```bash
curl http://localhost
```

### Do Windows (Host)

Você precisa configurar Port Forwarding no VirtualBox:

1. **VirtualBox → Settings → Network → Advanced → Port Forwarding**
2. Adicione uma regra:
   - **Name**: HTTP
   - **Protocol**: TCP
   - **Host Port**: 8080 (ou outra porta livre)
   - **Guest Port**: 80

3. Acesse do Windows: **http://localhost:8080**

## 🔧 Comandos Úteis Ubuntu

### PM2

```bash
pm2 list                    # Listar processos
pm2 logs pharmacy-api       # Ver logs
pm2 restart pharmacy-api    # Reiniciar
pm2 stop pharmacy-api       # Parar
pm2 delete pharmacy-api     # Remover
pm2 monit                   # Monitor em tempo real
```

### Nginx

```bash
sudo systemctl start nginx      # Iniciar
sudo systemctl stop nginx       # Parar
sudo systemctl restart nginx    # Reiniciar
sudo systemctl reload nginx     # Recarregar config
sudo systemctl status nginx     # Ver status
sudo nginx -t                   # Testar configuração
```

### Logs

```bash
# PM2
pm2 logs

# Nginx
sudo tail -f /var/log/nginx/pharmacy_access.log
sudo tail -f /var/log/nginx/pharmacy_error.log

# Sistema
journalctl -u nginx -f
```

## 🔒 Firewall (Opcional)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 2222/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (se configurar SSL)
sudo ufw allow 443/tcp

# Ver status
sudo ufw status
```

## 📝 Script de Deploy Automático para Ubuntu

Crie o arquivo `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Iniciando deploy da Farmácia Popular..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build Backend
echo -e "${YELLOW}🔨 Compilando backend...${NC}"
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao compilar backend!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend compilado${NC}"

# Build Frontend
echo -e "${YELLOW}🔨 Compilando frontend...${NC}"
cd ../frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao compilar frontend!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend compilado${NC}"

# PM2
echo -e "${YELLOW}🚀 Reiniciando PM2...${NC}"
cd ../backend
pm2 restart pharmacy-api || pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✓ PM2 reiniciado${NC}"

# Nginx
echo -e "${YELLOW}🔄 Recarregando Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✓ Nginx recarregado${NC}"

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "Acesse: http://localhost"

cd ..
```

Tornar executável:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🐛 Troubleshooting

### Erro de permissão no Nginx

```bash
# Dar permissão de leitura para o Nginx
chmod -R 755 ~/test_servidor_vm/frontend/dist
```

### Porta 3000 já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :3000

# Matar processo
sudo kill -9 <PID>
```

### PM2 não inicia no boot

```bash
pm2 startup
# Execute o comando sudo que aparecer
pm2 save
```

### Nginx não inicia

```bash
# Ver logs de erro
sudo journalctl -u nginx -n 50

# Testar configuração
sudo nginx -t
```

## 📊 Monitoramento

```bash
# CPU e Memória
htop

# Processos Node
ps aux | grep node

# Espaço em disco
df -h

# PM2 Monitor
pm2 monit
```

## ✅ Checklist de Deploy Ubuntu

- [ ] Node.js e npm instalados
- [ ] PM2 instalado globalmente
- [ ] Nginx instalado
- [ ] Arquivos transferidos para VM
- [ ] Dependências instaladas (backend e frontend)
- [ ] Backend compilado (`npm run build`)
- [ ] Frontend compilado (`npm run build`)
- [ ] Backend rodando no PM2
- [ ] Nginx configurado
- [ ] Nginx rodando
- [ ] Port forwarding configurado (VirtualBox)
- [ ] Testar http://localhost na VM
- [ ] Testar http://localhost:8080 no Windows

## 🎯 Próximos Passos

- Configurar domínio (se tiver)
- Adicionar SSL/HTTPS com Let's Encrypt
- Configurar backup automático do banco
- Monitoramento com PM2 Plus
