#!/bin/bash

# Script de Deploy Automático - Ubuntu VM
# Farmácia Popular

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Iniciando deploy da Farmácia Popular...${NC}\n"

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto!${NC}"
    exit 1
fi

# 1. Build Backend
echo -e "${YELLOW}🔨 Compilando backend...${NC}"
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao compilar backend!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend compilado com sucesso${NC}\n"

# 2. Build Frontend
echo -e "${YELLOW}🔨 Compilando frontend...${NC}"
cd ../frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao compilar frontend!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend compilado com sucesso${NC}\n"

# 3. PM2 - Reiniciar ou iniciar
echo -e "${YELLOW}🚀 Gerenciando PM2...${NC}"
cd ../backend

# Verificar se já existe
pm2 describe pharmacy-api > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Reiniciando aplicação existente..."
    pm2 restart pharmacy-api
else
    echo "Iniciando nova aplicação..."
    pm2 start ecosystem.config.js
fi

pm2 save
echo -e "${GREEN}✓ PM2 configurado${NC}\n"

# 4. Nginx
echo -e "${YELLOW}🔄 Recarregando Nginx...${NC}"
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx recarregado${NC}\n"
else
    echo -e "${YELLOW}⚠️  Nginx pode não estar configurado ainda${NC}\n"
fi

# 5. Status
echo -e "${CYAN}📊 Status dos serviços:${NC}"
pm2 status

echo -e "\n${GREEN}✅ Deploy concluído com sucesso!${NC}\n"
echo -e "${CYAN}📝 Informações:${NC}"
echo -e "  • Backend: http://localhost:3000"
echo -e "  • Frontend: http://localhost"
echo -e "  • Login: admin@pharmacy.com / admin123"
echo -e "\n${CYAN}📚 Comandos úteis:${NC}"
echo -e "  • Ver logs: ${YELLOW}pm2 logs${NC}"
echo -e "  • Status: ${YELLOW}pm2 status${NC}"
echo -e "  • Monitorar: ${YELLOW}pm2 monit${NC}"

cd ..
