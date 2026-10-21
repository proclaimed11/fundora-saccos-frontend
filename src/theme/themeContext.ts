import { createContext, useContext } from 'react'
import type { PaletteId, ThemePalette } from './themePalettes'

export const themeSurfaces = [
  { id: 'topHeader', label: 'Top header', description: 'Main navigation bar and notification badge ring.' },
  { id: 'pageHeader', label: 'Page header', description: 'The colored title band at the top of each page.' },
  { id: 'sidebarIndicator', label: 'Sidebar active indicator', description: 'The narrow accent beside the selected navigation item.' },
  { id: 'sidebarHighlight', label: 'Sidebar active and hover', description: 'The background behind active or hovered navigation items.' },
  { id: 'primary', label: 'Primary components', description: 'Primary buttons, form controls, and chart accents.' },
  { id: 'loader', label: 'Loader', description: 'The spinning progress indicator shown during navigation.' },
  { id: 'contentBackground', label: 'Content background', description: 'The page canvas, including the sign-in screen background.' },
] as const

export type ThemeSurface = (typeof themeSurfaces)[number]['id']
export type ThemeSurfaceColors = Record<ThemeSurface, string>
export type ThemeSurfaceOverrides = Partial<ThemeSurfaceColors>

export type ThemeContextValue = {
  palette: ThemePalette
  setPaletteId: (paletteId: PaletteId) => void
  surfaceColors: ThemeSurfaceColors
  surfaceOverrides: ThemeSurfaceOverrides
  setSurfaceColor: (surface: ThemeSurface, color: string) => void
  resetSurfaceColor: (surface: ThemeSurface) => void
  resetThemeCustomization: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useAppTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider')
  }
  return context
}
