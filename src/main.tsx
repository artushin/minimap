import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initializeHeadersFromQueryParams } from './utils/queryParams'

// Initialize REQUEST_HEADERS from query params before React renders
initializeHeadersFromQueryParams();

createRoot(document.getElementById('root')!).render(
    <App />
)
