import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './index.css'
import '@mantine/core/styles.layer.css'
import '@mantine/dates/styles.layer.css'
import 'mantine-datatable/styles.layer.css'
import '@mantine/spotlight/styles.layer.css'
import App from './App.tsx'

import { MantineProvider, createTheme, type MantineColorsTuple } from '@mantine/core'
import { AuthProvider } from './auth/authContext.tsx'
import { BrowserRouter } from 'react-router-dom'

const fontStack = '"Inter Variable", Inter, "Helvetica Neue", Helvetica, Arial, sans-serif'

// index 6 is #268a0f, the theme color
const brand: MantineColorsTuple = [
  '#effcec', '#dbf7d6', '#b7efae', '#8fe583',
  '#68dc58', '#4cd63a', '#39d128', '#2fb120',
  '#259118', '#1c7011',
]

const theme = createTheme({
  primaryColor: 'brand',
  colors: { brand },
  primaryShade: 6,
  defaultRadius: 'md',
  fontFamily: fontStack,
  headings: { fontFamily: fontStack },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="light">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
)