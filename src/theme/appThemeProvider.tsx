import {
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createTheme, MantineProvider, type MantineColorsTuple } from '@mantine/core'
import { ThemeContext } from './themeContext'
import { themeSurfaces } from './themeContext'
import {
  isPaletteId,
  themePalettes,
  type PaletteId,
} from './themePalettes'
import type {
  ThemeSurface,
  ThemeSurfaceColors,
  ThemeSurfaceOverrides,
} from './themeContext'

const PALETTE_STORAGE_KEY = 'project-tracker-theme'
const COLORS_STORAGE_KEY = 'project-tracker-theme-colors'
const FONT_STACK = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'

type ThemeVariables = CSSProperties & {
  '--app-brand': string
  '--app-brand-deep': string
  '--app-top-header': string
  '--app-page-header': string
  '--app-brand-dark': string
  '--app-brand-light': string
  '--app-brand-subtle': string
  '--app-sidebar-indicator': string
  '--app-sidebar-highlight': string
  '--app-content-background': string
  '--app-loader': string
}

function getInitialPaletteId(): PaletteId {
  const storedPaletteId = window.localStorage.getItem(PALETTE_STORAGE_KEY)
  return isPaletteId(storedPaletteId) ? storedPaletteId : 'green'
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function getInitialOverrides(): ThemeSurfaceOverrides {
  const stored = window.localStorage.getItem(COLORS_STORAGE_KEY)
  if (!stored) return {}

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!isRecord(parsed)) return {}
    const validOverrides: ThemeSurfaceOverrides = {}
    themeSurfaces.forEach(({ id }) => {
      const color = parsed[id]
      if (isHexColor(color)) validOverrides[id] = color.toLowerCase()
    })
    return validOverrides
  } catch {
    return {}
  }
}

function mixHex(first: string, second: string, amount: number) {
  const firstChannels = first.match(/[\da-f]{2}/gi)?.map((channel) => Number.parseInt(channel, 16)) ?? []
  const secondChannels = second.match(/[\da-f]{2}/gi)?.map((channel) => Number.parseInt(channel, 16)) ?? []
  return `#${firstChannels
    .map((channel, index) =>
      Math.round(channel + (secondChannels[index] - channel) * amount)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

function createCustomBrandShades(primary: string): MantineColorsTuple {
  const lighterMixes = [0.94, 0.86, 0.72, 0.54, 0.34, 0.16]
  const darkerMixes = [0.14, 0.3, 0.48]
  return [
    mixHex(primary, '#ffffff', lighterMixes[0]),
    mixHex(primary, '#ffffff', lighterMixes[1]),
    mixHex(primary, '#ffffff', lighterMixes[2]),
    mixHex(primary, '#ffffff', lighterMixes[3]),
    mixHex(primary, '#ffffff', lighterMixes[4]),
    mixHex(primary, '#ffffff', lighterMixes[5]),
    primary,
    mixHex(primary, '#000000', darkerMixes[0]),
    mixHex(primary, '#000000', darkerMixes[1]),
    mixHex(primary, '#000000', darkerMixes[2]),
  ]
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [paletteId, setPaletteIdState] = useState<PaletteId>(getInitialPaletteId)
  const [overrides, setOverrides] = useState<ThemeSurfaceOverrides>(getInitialOverrides)
  const palette = themePalettes.find((item) => item.id === paletteId)
  if (!palette) {
    throw new Error(`Unknown theme palette: ${paletteId}`)
  }

  const setPaletteId = (nextPaletteId: PaletteId) => {
    window.localStorage.setItem(PALETTE_STORAGE_KEY, nextPaletteId)
    setPaletteIdState(nextPaletteId)
  }

  const baseBrand = overrides.primary ?? palette.shades[6]
  const brandShades = useMemo<MantineColorsTuple>(
    () => (overrides.primary ? createCustomBrandShades(baseBrand) : palette.shades),
    [baseBrand, overrides.primary, palette.shades],
  )
  const defaultSurfaceColors = useMemo<ThemeSurfaceColors>(
    () => ({
      topHeader: palette.shades[7],
      pageHeader: palette.shades[7],
      sidebarIndicator: palette.shades[6],
      sidebarHighlight: '#fafcfb',
      primary: palette.shades[6],
      loader: palette.shades[6],
      contentBackground: '#fafcfb',
    }),
    [palette],
  )
  const surfaceColors = useMemo(
    () => ({ ...defaultSurfaceColors, ...overrides }),
    [defaultSurfaceColors, overrides],
  )

  const setSurfaceColor = (surface: ThemeSurface, color: string) => {
    if (!isHexColor(color)) {
      throw new Error(`Invalid theme color for ${surface}: ${color}`)
    }
    const nextOverrides = { ...overrides, [surface]: color.toLowerCase() }
    window.localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(nextOverrides))
    setOverrides(nextOverrides)
  }

  const resetSurfaceColor = (surface: ThemeSurface) => {
    const nextOverrides = { ...overrides }
    delete nextOverrides[surface]
    if (Object.keys(nextOverrides).length === 0) {
      window.localStorage.removeItem(COLORS_STORAGE_KEY)
    } else {
      window.localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(nextOverrides))
    }
    setOverrides(nextOverrides)
  }

  const resetThemeCustomization = () => {
    window.localStorage.removeItem(COLORS_STORAGE_KEY)
    setOverrides({})
  }

  const theme = useMemo(
    () =>
      createTheme({
        primaryColor: 'brand',
        colors: { brand: brandShades },
        primaryShade: 6,
        defaultRadius: 'md',
        fontFamily: FONT_STACK,
        headings: { fontFamily: FONT_STACK },
      }),
    [brandShades],
  )

  const themeVariables = useMemo<ThemeVariables>(
    () => ({
      '--app-brand': surfaceColors.primary,
      '--app-brand-deep': palette.shades[8],
      '--app-top-header': surfaceColors.topHeader,
      '--app-page-header': surfaceColors.pageHeader,
      '--app-brand-dark': palette.shades[8],
      '--app-brand-light': palette.shades[0],
      '--app-brand-subtle': '#fafcfb',
      '--app-sidebar-indicator': surfaceColors.sidebarIndicator,
      '--app-sidebar-highlight': surfaceColors.sidebarHighlight,
      '--app-content-background': surfaceColors.contentBackground,
      '--app-loader': surfaceColors.loader,
    }),
    [palette, surfaceColors],
  )

  useLayoutEffect(() => {
    const root = document.documentElement
    Object.entries(themeVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }, [themeVariables])

  return (
    <ThemeContext.Provider
      value={{
        palette,
        setPaletteId,
        surfaceColors,
        surfaceOverrides: overrides,
        setSurfaceColor,
        resetSurfaceColor,
        resetThemeCustomization,
      }}
    >
      <MantineProvider theme={theme} forceColorScheme="light">
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  )
}
