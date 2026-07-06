import { ColorModeProvider } from '../theme/ColorModeContext';
import { LandingPage } from './LandingPage';

export function LandingRoute() {
  return (
    <ColorModeProvider>
      <LandingPage />
    </ColorModeProvider>
  );
}
