import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import { viewFromPath } from './HotelContext';
import './index.css';

// A magic-link URL (/admin/magic/<token>) isn't a real view -- stash the token for AdminGate to redeem on
// mount, then clean the URL down to /admin so refresh, back/forward and the normal view machinery all work.
const magicMatch = window.location.pathname.match(/^\/admin\/magic\/([^/]+)\/?$/);
if (magicMatch) {
  sessionStorage.setItem('horizon_pending_magic_token', magicMatch[1]);
  window.history.replaceState({}, '', '/admin');
}

const container = document.getElementById('root')!;
const initialView = viewFromPath(window.location.pathname);
const app = (
  <StrictMode>
    <App initialView={initialView} />
  </StrictMode>
);

// Production builds prerender the public views; hydrate when the HTML matches this URL's view,
// otherwise (e.g. /admin, which is not prerendered) render from scratch.
if (container.firstElementChild && container.dataset.view === initialView) {
  hydrateRoot(container, app);
} else {
  container.innerHTML = '';
  createRoot(container).render(app);
}
