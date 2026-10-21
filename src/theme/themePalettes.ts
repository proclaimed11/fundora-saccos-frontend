import type { MantineColorsTuple } from '@mantine/core'

export type PaletteId = 'green' | 'deep-blue' | 'deep-pink'

export type ThemePalette = {
  id: PaletteId
  name: string
  description: string
  shades: MantineColorsTuple
}

export const themePalettes: ThemePalette[] = [
  {
    id: 'green',
    name: 'Green',
    description: 'The current green theme',
    shades: [
      '#effcec',
      '#dbf7d6',
      '#b7efae',
      '#8fe583',
      '#68dc58',
      '#4cd63a',
      '#39d128',
      '#2fb120',
      '#259118',
      '#1c7011',
    ],
  },
  {
    id: 'deep-blue',
    name: 'Deep Blue',
    description: 'A deep blue theme',
    shades: [
      '#e8f0fe',
      '#d2e1fc',
      '#a6c4f7',
      '#79a6f1',
      '#4d89eb',
      '#306fdb',
      '#2458bd',
      '#1c4698',
      '#153574',
      '#0e244f',
    ],
  },
  {
    id: 'deep-pink',
    name: 'Deep Pink',
    description: 'A deep pink theme',
    shades: [
      '#fce8f1',
      '#f9d1e3',
      '#f2a6c8',
      '#eb79ac',
      '#e44d90',
      '#d72e78',
      '#bb2164',
      '#971a50',
      '#73143d',
      '#4f0e2a',
    ],
  },
]

export function isPaletteId(value: string | null): value is PaletteId {
  return themePalettes.some((palette) => palette.id === value)
}
