# 💰 Sistema de Gestão Financeira

> Sistema Full Stack de Gestão Financeira desenvolvido com **Java,
> Spring Boot, React, PostgreSQL e Docker**, simulando uma aplicação
> corporativa para controle de receitas, despesas e indicadores
> financeiros.

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring
Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge)

------------------------------------------------------------------------

## 📚 Sobre

Aplicação Full Stack para gerenciamento financeiro pessoal e
empresarial. O sistema permite controlar receitas, despesas, categorias,
dashboards, relatórios e indicadores, utilizando arquitetura em camadas,
autenticação JWT e interface moderna.

## ✨ Funcionalidades

-   Login e autenticação JWT
-   Dashboard financeiro
-   Controle de receitas
-   Controle de despesas
-   Categorias financeiras
-   Relatórios e gráficos
-   Pesquisa e filtros
-   Exportação de dados
-   Swagger/OpenAPI
-   Docker Compose

## 🏗️ Arquitetura

``` text
React
  │
Axios
  │
Spring Boot
  │
Spring Security + JWT
  │
Services
  │
Repositories (JPA)
  │
PostgreSQL
```

## 🛠️ Tecnologias

### Backend

-   Java 21
-   Spring Boot
-   Spring Security
-   Spring Data JPA
-   Hibernate
-   JWT
-   Flyway
-   Bean Validation
-   Swagger/OpenAPI

### Frontend

-   React
-   Vite
-   Material UI
-   Axios
-   Recharts

### Banco de Dados

-   PostgreSQL

### Infraestrutura

-   Docker
-   Docker Compose
-   Nginx

## 📂 Estrutura

``` text
gestao-financeira/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## ▶️ Como executar

``` bash
git clone https://github.com/matheus-samuel-dev/sistema-gestao-financeira.git
cd sistema-gestao-financeira
docker compose up --build
```

Ou execute frontend e backend separadamente.

## 📊 Dashboard

-   Saldo atual
-   Receitas do mês
-   Despesas do mês
-   Evolução do saldo
-   Receitas × Despesas
-   Despesas por categoria
-   Últimas movimentações

## 🔐 Segurança

-   Spring Security
-   JWT
-   Rotas protegidas
-   Validação de dados
-   Tratamento centralizado de exceções

## 📡 Swagger

``` text
http://localhost:8080/swagger-ui.html
```

## 📸 Screenshots

### 🏠 1. Login

Tela inicial da aplicação, com acesso seguro através de autenticação JWT.

<p align="center">
  <img src="./screenshots/Login_gestãoFinanceira.png" alt="Tela de Login" width="100%">
</p>

---

### 📊 2. Dashboard

Visão geral das finanças com indicadores, gráficos, fluxo de caixa e resumo das principais métricas.

<p align="center">
  <img src="./screenshots/Dashboard_gestãoFinanceira.png" alt="Dashboard Financeiro" width="100%">
</p>

---

### 💸 3. Transações

Gerenciamento completo de receitas e despesas, com filtros, paginação, exportação para PDF/Excel e operações de edição e exclusão.

<p align="center">
  <img src="./screenshots/Transacoes_gestãoFinanceira.png" alt="Gestão de Transações" width="100%">
</p>

---

### 🎯 4. Metas

Acompanhamento de metas financeiras, progresso, valores acumulados e objetivos planejados.

<p align="center">
  <img src="./screenshots/Metas_gestãoFinanceira.png" alt="Metas Financeiras" width="100%">
</p>

## 🚀 Roadmap

-   [x] Dashboard
-   [x] CRUD de Receitas
-   [x] CRUD de Despesas
-   [x] Categorias
-   [x] Docker
-   [x] Swagger
-   [ ] Metas Financeiras
-   [ ] Notificações
-   [ ] Aplicativo Mobile

## 👨‍💻 Autor

**Matheus Samuel**

-   GitHub: https://github.com/matheus-samuel-dev
-   LinkedIn: https://linkedin.com/in/matheus-samuel-dev
-   Portfólio: https://matheus-samuel-dev.github.io/Portfolio/

## 📄 Licença

Projeto desenvolvido para fins de estudo, demonstração técnica e
portfólio.
