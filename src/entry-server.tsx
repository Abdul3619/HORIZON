import {StrictMode} from 'react';
import {renderToString} from 'react-dom/server';
import App from './App';
import type { View } from './types';

// Used at build time (scripts/prerender.mjs) to put each public view's content into its own HTML file
export function render(view: View) {
  return renderToString(
    <StrictMode>
      <App initialView={view} />
    </StrictMode>,
  );
}
