# Solução para o Erro de Instalação do Backend

## Problema

O erro ocorre porque o `better-sqlite3` é um módulo nativo que precisa ser compilado no Windows, e o `node-gyp` requer ferramentas de build do Visual Studio.

## Solução Recomendada

Execute este comando como **Administrador** no PowerShell:

```powershell
npm install --global windows-build-tools
```

Isso instalará automaticamente:
- Python 2.7
- Visual Studio Build Tools

**Depois execute:**

```bash
cd backend
npm install
```

## Solução Alternativa Rápida

Se a solução acima não funcionar, você pode instalar as dependências manualmente:

```bash
cd backend

# Instalar dependências que não precisam de compilação
npm install express cors cookie-parser bcrypt
npm install --save-dev @types/express @types/cors @types/cookie-parser @types/bcrypt @types/node typescript ts-node nodemon

# Tentar instalar better-sqlite3 separadamente
npm install better-sqlite3
```

## Solução 3: Usar versão pré-compilada

Adicione isto ao `package.json` antes de instalar:

```json
"overrides": {
  "better-sqlite3": {
    "prebuild-install": "^7.1.1"
  }
}
```

Depois:

```bash
npm install
```

## Verificar Instalação

Após instalar com sucesso, teste:

```bash
npm run dev
```

O servidor deve iniciar em `http://localhost:3000`

## Notas

- O erro é comum no Windows com módulos nativos
- A instalação das build tools pode demorar alguns minutos
- Se nada funcionar, podemos usar uma alternativa ao better-sqlite3
