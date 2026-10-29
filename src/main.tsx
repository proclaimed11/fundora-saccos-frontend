import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import './index.css'
import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import 'mantine-datatable/styles.layer.css'
import '@mantine/spotlight/styles.layer.css'
import App from './App.tsx'

import { AuthProvider } from './auth/authContext.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AppThemeProvider } from './theme/appThemeProvider'
import { RolesProvider } from './pages/administration/roles/rolesProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <RolesProvider>
            <App />
          </RolesProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppThemeProvider>
  </StrictMode>
)