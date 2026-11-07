import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import IdentityDialog from './IdentityDialog';
import './index.css';
import './identity.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <IdentityDialog />
  </StrictMode>
);
