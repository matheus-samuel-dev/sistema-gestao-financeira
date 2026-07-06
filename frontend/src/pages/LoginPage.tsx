import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiDebugInfo, getLoginErrorMessage } from '../utils/apiError';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_SAFETY_TIMEOUT_MS = 15000;

type LoginNotice = {
  message: string;
  tone: 'error' | 'info';
};

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@financeiro.com');
  const [password, setPassword] = useState('123456');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<LoginNotice | null>(null);

  useEffect(() => {
    if (searchParams.get('sessionExpired') === '1') {
      setNotice({ message: 'Sua sessão expirou. Entre novamente para continuar.', tone: 'info' });
    }
  }, [searchParams]);

  const isSubmitDisabled = useMemo(
    () => submitting || !email.trim() || !password,
    [email, password, submitting],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setNotice({ message: 'Informe um e-mail válido.', tone: 'error' });
      return;
    }

    const controller = new AbortController();
    const safetyTimeout = window.setTimeout(() => {
      controller.abort();
    }, LOGIN_SAFETY_TIMEOUT_MS);

    setSubmitting(true);
    setNotice(null);

    try {
      await login({ email: email.trim(), password }, { signal: controller.signal });
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      console.error('[Auth] Login não concluído.', {
        ...getApiDebugInfo(error),
        safetyTimeout: LOGIN_SAFETY_TIMEOUT_MS,
      });
      setNotice({ message: getLoginErrorMessage(error), tone: 'error' });
    } finally {
      window.clearTimeout(safetyTimeout);
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-showcase" aria-label="Finance Flow Pro">
          <RouterLink className="login-brand" to="/" aria-label="Finance Flow Pro">
            <span className="login-brand-icon" aria-hidden>
              <span />
            </span>
            <span>Finance Flow Pro</span>
          </RouterLink>

          <div className="login-showcase-copy">
            <span className="login-badge">Acesso seguro</span>
            <h1>Finance Flow Pro</h1>
            <p>Entre no painel e acompanhe caixa, metas e relatórios com a identidade visual do produto.</p>
          </div>

          <div className="login-product-panel" aria-hidden>
            <div className="login-panel-header">
              <div>
                <strong>Operação demo</strong>
                <span>Julho de 2026</span>
              </div>
              <em>Saudável</em>
            </div>
            <div className="login-panel-grid">
              <span>
                Saldo atual
                <strong>R$ 71.460</strong>
              </span>
              <span>
                Receitas
                <strong>R$ 87.400</strong>
              </span>
              <span>
                Despesas
                <strong>R$ 15.940</strong>
              </span>
            </div>
            <div className="login-panel-progress">
              <span />
            </div>
          </div>
        </section>

        <section aria-labelledby="login-title" className="login-card">
          <div className="login-card-top">
            <div className="login-mark" aria-hidden>
              <span />
            </div>
            <span>Bem-vindo de volta</span>
          </div>

          <div className="login-copy">
            <h2 id="login-title">Entrar na sua operação</h2>
            <p>Use a conta demo ou acesse seu ambiente privado.</p>
          </div>

          {notice && (
            <div className={`login-alert login-alert--${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}>
              {notice.message}
            </div>
          )}

          <form aria-busy={submitting} className="login-form" noValidate onSubmit={(event) => void handleSubmit(event)}>
            <label className="login-field">
              <span>E-mail</span>
              <input
                autoComplete="email"
                inputMode="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
              />
            </label>

            <label className="login-field">
              <span>Senha</span>
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            <button className="login-submit" disabled={isSubmitDisabled} type="submit">
              {submitting && <span className="login-submit-spinner" aria-hidden />}
              <span>{submitting ? 'Entrando...' : 'Entrar'}</span>
            </button>
          </form>

          <p className="login-register">
            Ainda não tem conta? <RouterLink to="/cadastro">Criar cadastro</RouterLink>
          </p>
        </section>
      </div>
    </main>
  );
}
