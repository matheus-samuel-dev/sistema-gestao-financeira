CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    theme_preference VARCHAR(20) NOT NULL DEFAULT 'LIGHT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    type VARCHAR(20) NOT NULL,
    color VARCHAR(20) NOT NULL,
    icon VARCHAR(40) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    system_default BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL REFERENCES users (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(140) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    note VARCHAR(500),
    frequency VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_execution DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    category_id BIGINT NOT NULL REFERENCES categories (id),
    user_id BIGINT NOT NULL REFERENCES users (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_goals (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL,
    current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    deadline DATE NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    category_id BIGINT REFERENCES categories (id),
    user_id BIGINT NOT NULL REFERENCES users (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_transactions (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(140) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    note VARCHAR(500),
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    category_id BIGINT NOT NULL REFERENCES categories (id),
    user_id BIGINT NOT NULL REFERENCES users (id),
    recurring_transaction_id BIGINT REFERENCES recurring_transactions (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_user ON categories (user_id);
CREATE INDEX idx_transactions_user_date ON financial_transactions (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_type ON financial_transactions (user_id, type);
CREATE INDEX idx_transactions_user_amount ON financial_transactions (user_id, amount);
CREATE INDEX idx_goals_user_deadline ON financial_goals (user_id, deadline);
CREATE INDEX idx_recurring_user_next_execution ON recurring_transactions (user_id, next_execution);
