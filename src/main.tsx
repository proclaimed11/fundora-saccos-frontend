import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/livvic/400.css'
import '@fontsource/livvic/400-italic.css'
import '@fontsource/livvic/500.css'
import '@fontsource/livvic/600.css'
import '@fontsource/livvic/700.css'
import '@fontsource/livvic/900.css'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'
import './index.css'
import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import 'mantine-datatable/styles.layer.css'
import '@mantine/spotlight/styles.layer.css'
import App from './App.tsx'

import { AuthProvider } from './auth/authContext.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AppThemeProvider } from './theme/appThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>
)