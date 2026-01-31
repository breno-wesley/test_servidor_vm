# Script de Deploy Automático - Farmácia Popular
# Execute como Administrador no PowerShell

Write-Host "🚀 Iniciando deploy da Farmácia Popular..." -ForegroundColor Green

# 1. Parar servidores de desenvolvimento
Write-Host "`n📛 Parando servidores de desenvolvimento..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✓ Servidores de desenvolvimento parados" -ForegroundColor Green

# 2. Build do Backend
Write-Host "`n🔨 Compilando backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar backend!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend compilado com sucesso" -ForegroundColor Green

# 3. Build do Frontend
Write-Host "`n🔨 Compilando frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar frontend!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend compilado com sucesso" -ForegroundColor Green

# 4. Voltar para raiz
Set-Location ..

# 5. Verificar PM2
Write-Host "`n🔍 Verificando PM2..." -ForegroundColor Yellow
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue
if (-not $pm2Installed) {
    Write-Host "⚠️  PM2 não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g pm2
    Write-Host "✓ PM2 instalado" -ForegroundColor Green
} else {
    Write-Host "✓ PM2 já instalado" -ForegroundColor Green
}

# 6. Iniciar backend com PM2
Write-Host "`n🚀 Iniciando backend com PM2..." -ForegroundColor Yellow
Set-Location backend

# Parar processo anterior se existir
pm2 delete pharmacy-api -s 2>$null

# Iniciar novo processo
pm2 start ecosystem.config.js
pm2 save

Write-Host "✓ Backend iniciado com PM2" -ForegroundColor Green

# 7. Mostrar status
Write-Host "`n📊 Status dos processos:" -ForegroundColor Cyan
pm2 status

# 8. Instruções finais
Write-Host "`n✅ Deploy concluído!" -ForegroundColor Green
Write-Host "`n📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Instale o Nginx (se ainda não tiver)" -ForegroundColor White
Write-Host "   choco install nginx -y" -ForegroundColor Gray
Write-Host "`n2. Copie o arquivo nginx.conf para a pasta do Nginx" -ForegroundColor White
Write-Host "   Geralmente: C:\nginx\conf\nginx.conf" -ForegroundColor Gray
Write-Host "`n3. Inicie o Nginx" -ForegroundColor White
Write-Host "   cd C:\nginx" -ForegroundColor Gray
Write-Host "   start nginx" -ForegroundColor Gray
Write-Host "`n4. Acesse a aplicação" -ForegroundColor White
Write-Host "   http://localhost" -ForegroundColor Gray
Write-Host "`n📚 Consulte DEPLOY_GUIDE.md para mais detalhes" -ForegroundColor Cyan

# Voltar para raiz
Set-Location ..
