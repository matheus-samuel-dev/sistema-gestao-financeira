import { ToastProvider } from '../../contexts/ToastContext';
import { ColorModeProvider } from '../../theme/ColorModeContext';
import { AppShell } from './AppShell';

export function AuthenticatedApp() {
  return (
    <ColorModeProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </ColorModeProvider>
  );
}
