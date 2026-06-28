import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ColorModeProvider } from './theme/ColorModeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <ColorModeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ColorModeProvider>
    </AuthProvider>
  </BrowserRouter>,
);
