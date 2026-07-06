# Finance Flow Pro

Sistema full stack de gestao financeira para portfolio, com backend em Spring Boot Java 21, frontend em React TypeScript e banco PostgreSQL.

## Stack

- Backend: Java 21, Spring Boot 3.5, Spring Security, JWT, BCrypt, Spring Data JPA, Flyway, Bean Validation, Swagger/OpenAPI.
- Frontend: React 19, TypeScript, Vite, Material UI, Axios, Recharts, jsPDF, XLSX.
- Banco: PostgreSQL.
- Qualidade: JUnit 5, Mockito, Spring Security Test, Vitest, Testing Library, ESLint, GitHub Actions.
- Infra: Docker, Docker Compose, Nginx.

## Funcionalidades

- Autenticacao e sessao com JWT.
- Dashboard financeiro com KPIs, graficos e ultimas movimentacoes.
- CRUD de transacoes, categorias, metas e recorrencias.
- Relatorios financeiros com comparativos mensais e ranking de despesas.
- Exportacao PDF/Excel.
- Filtros por periodo, tipo, categoria, status e faixa de valor.
- Tema claro/escuro e layout responsivo.

## Arquitetura

```text
React + Vite
  -> Axios client
  -> Spring Security + JWT filter
  -> Controllers REST
  -> Services com regras de negocio
  -> Repositories Spring Data JPA
  -> PostgreSQL
```

O backend usa services para centralizar regras de negocio e garantir propriedade dos recursos por usuario. Repositories usam JPA Specifications para filtros dinamicos. O frontend consome a API por um cliente Axios compartilhado, com interceptadores para token e expiracao de sessao.

## Banco e migrations

O projeto usa Flyway para versionamento do banco.

- `spring.jpa.hibernate.ddl-auto=validate`
- Migrations em `backend/src/main/resources/db/migration`
- Migration inicial: `V1__initial_schema.sql`

Essa decisao remove a dependencia de `ddl-auto: update`, evitando alteracoes implicitas de schema em ambientes de producao.

## Seguranca

- Senhas com BCrypt.
- API stateless com JWT.
- Rotas internas protegidas por Spring Security.
- Validacao de dados com Bean Validation.
- Propriedade dos recursos garantida por consultas `findByIdAndUser` e filtros por usuario.
- Handler global retorna mensagens amigaveis e registra excecoes inesperadas com stack trace no log.

### Decisao sobre armazenamento do JWT

Atualmente o frontend mantem o JWT em `localStorage` por simplicidade operacional e por ser adequado ao escopo de portfolio/demo. O risco principal e exposicao em caso de XSS. Mitigacoes atuais:

- React escapa conteudo por padrao.
- Sem uso de HTML arbitrario em inputs do usuario.
- Tokens sao removidos em 401/403.
- Axios redireciona para login em sessao expirada.

Para um SaaS real em producao, a evolucao recomendada e migrar para cookie `httpOnly`, `Secure`, `SameSite=Lax/Strict`, com estrategia de CSRF adequada.

## Performance

Melhorias aplicadas:

- `buildCategoryBreakdown` deixou de fazer busca repetida O(n²) e passou a agregar por `Map` em uma passada.
- Comparacao mensal de relatorios agrupa transacoes por mes antes de calcular os totais.
- Indices de banco adicionados para consultas por usuario, data, tipo e valor.
- Frontend usa lazy loading de paginas e chunks separados no Vite.

## Testes

### Backend

```bash
cd backend
mvn test
```

Cobertura adicionada para:

- Autenticacao e normalizacao de e-mail.
- JWT valido/invalido.
- Regras de categoria.
- Propriedade de recursos por usuario.
- Transacoes.
- Metas financeiras.
- Dashboard.
- Relatorios.
- Transacoes canceladas fora de totais financeiros.
- Filtros por faixa de valor.

### Frontend

```bash
cd frontend
npm ci
npm run lint
npm run test:run
npm run build
```

Cobertura adicionada para:

- Login e validacao de formulario.
- Interceptor Axios para 401/403.
- Dashboard e filtros.
- Listagem de transacoes.
- Exportacao respeitando filtros aplicados.
- Feedbacks de erro em formulario.

## Execucao local

### Com Docker

```bash
docker compose up --build
```

### Backend local

```bash
cd backend
mvn spring-boot:run
```

Variaveis principais:

```env
DB_URL=jdbc:postgresql://localhost:5432/finance_management
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=replace-this-secret-with-at-least-256-bits
JWT_EXPIRATION_HOURS=24
CORS_ALLOWED_ORIGINS=http://localhost:5176,http://127.0.0.1:5176
```

Swagger:

```text
http://localhost:8080/swagger-ui.html
```

### Frontend local

```bash
cd frontend
npm ci
npm run dev
```

URL padrao:

```text
http://localhost:5176
```

## Producao

Checklist recomendado:

- Definir `JWT_SECRET` forte via variavel de ambiente.
- Usar PostgreSQL gerenciado ou container persistente com volume.
- Rodar migrations Flyway no start da API.
- Configurar `CORS_ALLOWED_ORIGINS` apenas com dominios confiaveis.
- Servir frontend estatico via Nginx/CDN.
- Migrar JWT para cookie `httpOnly` em ambiente SaaS real.
- Habilitar observabilidade de logs e metricas.

## CI/CD

GitHub Actions em `.github/workflows/ci.yml` executa:

- Backend: Java 21 + `mvn test`.
- Frontend: Node 22 + `npm ci`, `npm run lint`, `npm run test:run`, `npm run build`.

## Licenca

Projeto desenvolvido para estudo, demonstracao tecnica e portfolio.
