import LoginPage from './LoginPage';

interface Props {
  onBackToAgent?: () => void;
}

/** Cosmic customer login when visitor is not an approved customer session. */
export default function PortalAuthGate({ onBackToAgent }: Props) {
  return <LoginPage audience="customer" onOpenAgent={onBackToAgent} />;
}
