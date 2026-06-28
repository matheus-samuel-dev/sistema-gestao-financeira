# Finance Flow Pro

Sistema de Gestão Financeira Pessoal / Empresarial full stack, criado para controle de receitas, despesas, categorias, metas financeiras, transações recorrentes, dashboard, relatórios e exportações em PDF/Excel.

O projeto foi estruturado como uma aplicação de portfólio profissional: backend com Spring Boot 3, segurança JWT, PostgreSQL, Swagger e testes; frontend React com Vite, TypeScript, Material UI, gráficos, tema claro/escuro e UX responsiva.

## Screenshots

Depois de subir o projeto, os principais pontos para capturar screenshots de portfólio são:

| Tela | Caminho | Destaque |
| --- | --- | --- |
| Landing | `/` | Apresentação do produto e CTA |
| Login | `/login` | Sessão demo pronta |
| Dashboard | `/app/dashboard` | Cards, gráficos e metas |
| Transações | `/app/transacoes` | Filtros, tabela/cards e exportação |
| Relatórios | `/app/relatorios` | Resumo financeiro, ranking e PDF/Excel |

## Funcionalidades

- Cadastro e login com JWT, BCrypt, validações e proteção de rotas.
- Perfil autenticado com edição de nome, tipo de conta, tema e senha.
- CRUD de categorias com cor, ícone, tipo, ativação e regra de exclusão segura.
- CRUD de receitas e despesas, com filtros, busca, status, paginação e recorrência.
- Transações recorrentes com frequência semanal, mensal ou anual.
- Metas Financeiras com progresso, prazo, status e categoria opcional.
- Dashboard com saldo atual, receitas, despesas, economia, percentual gasto, maior categoria, metas e últimas transações.
- Gráficos com Recharts: receitas x despesas, despesas por categoria, evolução do saldo, comparativo mensal e contagem por tipo.
- Relatórios por período, categoria, tipo, ranking de despesas e evolução mensal.
- Exportação PDF com jsPDF e Excel com SheetJS/xlsx.
- Tema claro/escuro persistido no perfil.
- Layout responsivo para desktop, tablet e celular.
- Seed automático com usuário demo e dados financeiros para apresentação.
- Docker Compose com PostgreSQL, backend, frontend, volumes e healthchecks.

## Stack

### Backend

- Java 21
- Spring Boot 3.5
- Spring Security
- JWT com `jjwt`
- Spring Data JPA
- PostgreSQL
- Swagger/OpenAPI com `springdoc-openapi`
- Maven
- JUnit 5 e Mockito

### Frontend

- React 19
- Vite
- TypeScript
- Material UI
- React Router
- Axios
- Recharts
- React Hook Form + Zod
- jsPDF
- SheetJS/xlsx

### Infra

- Docker
- Docker Compose
- PostgreSQL 16
- Nginx para servir o frontend em produção

## Arquitetura

```text
.
|-- backend
|   |-- src/main/java/com/portfolio/finance
|   |   |-- config
|   |   |-- controller
|   |   |-- domain/entity
|   |   |-- domain/enums
|   |   |-- domain/repository
|   |   |-- dto
|   |   |-- exception
|   |   |-- mapper
|   |   |-- security
|   |   `-- service
|   |-- src/test/java/com/portfolio/finance/service
|   |-- Dockerfile
|   `-- pom.xml
|-- frontend
|   |-- public
|   |-- src
|   |   |-- api
|   |   |-- components
|   |   |-- contexts
|   |   |-- pages
|   |   |-- theme
|   |   |-- types
|   |   `-- utils
|   |-- Dockerfile
|   `-- package.json
|-- docker-compose.yml
`-- .env.example
```

## Como Rodar Localmente

### 1. PostgreSQL

Crie um banco local:

```sql
CREATE DATABASE finance_management;
```

Ou use apenas o serviço PostgreSQL do Docker:

```bash
docker compose up postgres
```

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

API:

```text
http://localhost:8080/api
```

Swagger:

```text
http://localhost:8080/swagger-ui.html
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App:

```text
http://localhost:5176
```

## Como Rodar com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Serviços:

| Serviço | URL |
| --- | --- |
| Frontend | `http://localhost:5176` |
| Backend | `http://localhost:8080` |
| Swagger | `http://localhost:8080/swagger-ui.html` |
| PostgreSQL | `localhost:5433` |

## Variáveis de Ambiente

Copie `.env.example` para `.env` na raiz, se quiser customizar:

```bash
cp .env.example .env
```

Principais variáveis:

| Variável | Descrição |
| --- | --- |
| `POSTGRES_DB` | Nome do banco PostgreSQL |
| `POSTGRES_USER` | Usuário do banco |
| `POSTGRES_PASSWORD` | Senha do banco |
| `POSTGRES_PORT` | Porta exposta do PostgreSQL no host |
| `FRONTEND_PORT` | Porta pública do frontend no Docker |
| `DB_URL` | JDBC URL usada pelo backend |
| `DB_USERNAME` | Usuário usado pelo backend |
| `DB_PASSWORD` | Senha usada pelo backend |
| `JWT_SECRET` | Segredo usado para assinar tokens JWT |
| `JWT_EXPIRATION_HOURS` | Duração do token |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas para o frontend |
| `VITE_API_URL` | URL da API usada pelo frontend |

## Credenciais de Demonstração

O seed cria automaticamente:

```text
E-mail: demo@financeiro.com
Senha: 123456
```

Também são criados dados de exemplo:

- Categorias padrão de receitas e despesas.
- Receitas e despesas distribuídas nos últimos meses.
- Metas financeiras.
- Transações recorrentes.

## Endpoints Principais

| Contexto | Endpoint |
| --- | --- |
| Cadastro | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Sessão | `GET /api/auth/me` |
| Dashboard | `GET /api/dashboard` |
| Transações | `GET/POST/PUT/DELETE /api/transactions` |
| Categorias | `GET/POST/PUT/PATCH/DELETE /api/categories` |
| Metas | `GET/POST/PUT/DELETE /api/goals` |
| Recorrências | `GET/POST/PUT/DELETE /api/recurring-transactions` |
| Relatórios | `GET /api/reports` |
| Perfil | `GET/PUT /api/profile` |
| Senha | `PATCH /api/profile/password` |

## Validações Executadas

```bash
cd backend
mvn test
```

Resultado esperado: testes unitários passando.

```bash
cd frontend
npm run build
```

Resultado esperado: build de produção gerado com sucesso.

Observação: as bibliotecas pesadas de gráficos, PDF e Excel são separadas em chunks e os exportadores são carregados sob demanda.

## Testes

Os testes unitários cobrem:

- Cadastro com senha criptografada e criação de categorias padrão.
- Bloqueio de e-mail duplicado.
- Regras de categoria duplicada e categoria em uso.
- Criação de transação vinculada ao usuário autenticado.
- Cálculos principais do dashboard: saldo, receitas, despesas, economia e percentual gasto.

## Segurança

- Senhas criptografadas com BCrypt.
- JWT para autenticação stateless.
- CORS configurado por variável de ambiente.
- Controllers usam DTOs, sem expor entidades JPA diretamente.
- Serviços validam propriedade dos recursos pelo usuário autenticado.
- Categorias em uso não são excluídas para preservar histórico.

Nota sobre dependências: `jsPDF` foi atualizado para uma versão corrigida. O pacote `xlsx`, exigido pelo escopo, ainda possui advisories sem fix público no npm; para produção, uma alternativa recomendada é migrar a exportação para `exceljs` ou gerar planilhas no backend.

## Roadmap

- Testes E2E com Playwright cobrindo login, CRUDs e exportações.
- Upload de logotipo/avatar de empresa.
- Orçamentos mensais por categoria.
- Conciliação bancária via importação CSV/OFX.
- Multiempresa e compartilhamento de acesso.
- Notificações de metas próximas do prazo.
