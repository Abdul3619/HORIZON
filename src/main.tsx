import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import { viewFromPath } from './HotelContext';
import './index.css';

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
