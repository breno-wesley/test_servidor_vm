# 🚀 Quick Start - Deploy Ubuntu VM

## 1️⃣ Transferir Arquivos para VM

### Via SCP (do Windows)

```powershell
scp -P 2222 -r "C:\Users\breno\Desktop\Alpha EdTech\HardSkills\MiniDesafio_API_FarmaciaPopular\test_servidor_vm" brenowes@localhost:~/
```

## 2️⃣ Conectar na VM

```bash
ssh brenowes@localhost -p 2222
```

## 3️⃣ Instalar Dependências (primeira vez)

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx
```

## 4️⃣ Preparar Projeto

```bash
cd ~/test_servidor_vm

# Instalar dependências
cd backend && npm install
cd ../frontend && npm install
cd ..

# Tornar script executável
chmod +x deploy-ubuntu.sh
```

## 5️⃣ Deploy Automático

```bash
./deploy-ubuntu.sh
```

## 6️⃣ Configurar Nginx (primeira vez)

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/pharmacy
```

Cole a configuração (veja DEPLOY_UBUNTU_VM.md) e depois:

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/pharmacy /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Testar e reiniciar
sudo nginx -t
sudo systemctl restart nginx
```

## 7️⃣ Configurar Port Forwarding (VirtualBox)

No VirtualBox:
- **Settings → Network → Advanced → Port Forwarding**
- Adicionar regra: Host Port **8080** → Guest Port **80**

## 8️⃣ Acessar

- **Na VM**: http://localhost
- **No Windows**: http://localhost:8080
- **Login**: admin@pharmacy.com / admin123

## 🔧 Comandos Úteis

```bash
# PM2
pm2 status
pm2 logs
pm2 restart pharmacy-api

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx

# Logs
pm2 logs
sudo tail -f /var/log/nginx/pharmacy_error.log
```

## 📚 Documentação Completa

Ver `DEPLOY_UBUNTU_VM.md` para instruções detalhadas.
