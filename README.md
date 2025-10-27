# Projeto ANE Cortinas - Instruções de instalação no XAMPP

Este repositório contém um projeto PHP + MySQL (sem framework) pronto para ser executado localmente no XAMPP.

Pré-requisitos
- XAMPP instalado (Apache + MySQL).
- PHP na versão compatível (>= 7.4 recomendado) e com as extensões PDO, pdo_mysql habilitadas.

Passos para rodar no XAMPP
1. Copie a pasta `projeto_ane_cortinas` para o diretório `htdocs` do XAMPP. Exemplo:

   C:\xampp\htdocs\projeto_ane_cortinas

2. Abra o phpMyAdmin (http://localhost/phpmyadmin) e crie um banco de dados com o nome usado no arquivo `config/database.php`. Por padrão o arquivo está configurado para:

   DB_HOST = 127.0.0.1
   DB_NAME = tcc_refactored
   DB_USER = root
   DB_PASS = (vazio)

   Se preferir, ajuste `config/database.php` com suas credenciais.

3. Importe o arquivo `database.sql` pelo phpMyAdmin (aba Importar) para criar as tabelas e dados iniciais.

4. Verifique `config/jwt.php` e ajuste `JWT_SECRET` se desejar usar outro segredo.

5. Acesse o projeto no navegador:

   http://localhost/projeto_ane_cortinas/

API endpoints
- As APIs ficam em `api/`. Alguns exemplos:
  - `api/products/index.php`
  - `api/products/single.php?id=1`
  - `api/auth/login.php`

Notas de desenvolvimento
- Para upload de imagens, a pasta `uploads/fabrics` está preparada (contém um .gitkeep). Garanta permissões de escrita no diretório quando rodar no Windows/Apache.
- O projeto usa JWT para autenticação. Endpoints que alteram dados verificam o token e exigem papel `ADMIN`.

Como validar rapidamente
- Acesse `http://localhost/projeto_ane_cortinas/api/index.html` para testar a API básica (página estática).

Problemas comuns
- `php` não encontrado: dependendo do seu PATH, o comando `php` pode não estar disponível globalmente no PowerShell. Use o terminal do XAMPP (ou adicione o executável PHP do XAMPP ao PATH).

Se quiser, eu posso:
- Ajustar `config/database.php` para outro usuário/senha.
- Rodar verificações adicionais de sintaxe (necessita `php` no PATH).
- Gerar instruções para configurar VirtualHost no Apache para rodar em um hostname customizado.

