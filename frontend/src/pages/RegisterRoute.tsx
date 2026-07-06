import { ToastProvider } from '../contexts/ToastContext';
import { ColorModeProvider } from '../theme/ColorModeContext';
import { RegisterPage } from './RegisterPage';

export function RegisterRoute() {
  return (
    <ColorModeProvider>
      <ToastProvider>
        <RegisterPage />
      </ToastProvider>
    </ColorModeProvider>
  );
}
