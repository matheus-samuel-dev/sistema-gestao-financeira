import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/apiError';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    setSubmitting(true);
    setNotice(null);

    try {
      await login({ email: email.trim(), password });
      navigate('/app/dashboard');
    } catch (error) {
      setNotice({ message: getErrorMessage(error, 'Não foi possível entrar na plataforma.'), tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section aria-labelledby="login-title" className="login-card">
        <div className="login-mark" aria-hidden>
          <span />
        </div>

        <div className="login-copy">
          <h1 id="login-title">Entrar na sua operação</h1>
          <p>Use a conta demo ou acesse seu ambiente privado para controlar fluxo de caixa, metas e relatórios.</p>
        </div>

        {notice && (
          <div className={`login-alert login-alert--${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}>
            {notice.message}
          </div>
        )}

        <form className="login-form" noValidate onSubmit={(event) => void handleSubmit(event)}>
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
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="login-register">
          Ainda não tem conta? <RouterLink to="/cadastro">Criar cadastro</RouterLink>
        </p>
      </section>
    </main>
  );
}
