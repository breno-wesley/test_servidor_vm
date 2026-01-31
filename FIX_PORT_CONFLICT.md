# 🔧 Resolver Conflito de Porta 80 - Apache vs Nginx

## Problema Identificado

O Apache2 está usando a porta 80, impedindo o Nginx de iniciar.

```bash
# Verificado com:
sudo lsof -i :80
# Resultado: apache2 está na porta 80
```

## ✅ Solução: Parar Apache e Usar Nginx

Execute estes comandos na VM:

```bash
# 1. Parar Apache2
sudo systemctl stop apache2

# 2. Desabilitar Apache2 do boot (para não iniciar automaticamente)
sudo systemctl disable apache2

# 3. Verificar se a porta 80 está livre
sudo lsof -i :80
# Deve retornar vazio

# 4. Iniciar Nginx
sudo systemctl start nginx

# 5. Verificar status do Nginx
sudo systemctl status nginx

# 6. Habilitar Nginx para iniciar no boot
sudo systemctl enable nginx

# 7. Testar se está funcionando
curl http://localhost
```

## 🌐 Acessar a Aplicação

### Na VM:
```bash
curl http://localhost
```

### Do Windows (Host):

1. **Configure Port Forwarding no VirtualBox:**
   - VirtualBox → Configurações da VM → Rede → Avançado → Redirecionamento de Portas
   - Adicionar regra:
     - Nome: HTTP
     - Protocolo: TCP
     - IP do Host: (deixe vazio)
     - Porta do Host: **8080**
     - IP do Convidado: (deixe vazio)
     - Porta do Convidado: **80**

2. **Acesse do Windows:**
   - URL: **http://localhost:8080**
   - Login: admin@pharmacy.com / admin123

## 🔄 Alternativa: Usar Porta Diferente

Se quiser manter o Apache rodando e usar Nginx em outra porta:

```bash
# Editar configuração do Nginx
sudo nano /etc/nginx/sites-available/pharmacy

# Mudar a linha:
# De:   listen 80;
# Para: listen 8080;

# Reiniciar Nginx
sudo systemctl restart nginx

# Acessar em: http://localhost:8080
```

## ✅ Verificação Final

```bash
# Ver serviços rodando
sudo systemctl status nginx
sudo systemctl status apache2

# Ver portas em uso
sudo netstat -tlnp | grep -E ':(80|3000|8080)'

# Testar aplicação
curl http://localhost
curl http://localhost/api/health
```

## 📝 Resumo

- ✅ Apache2 parado e desabilitado
- ✅ Nginx iniciado na porta 80
- ✅ Backend rodando na porta 3000 (PM2)
- ✅ Nginx fazendo proxy reverso para o backend
- ✅ Frontend servido como arquivos estáticos pelo Nginx
