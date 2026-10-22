import { Button, ColorInput, SegmentedControl, Text } from '@mantine/core'
import { ContentCard } from '../components/contentCard'
import { DashboardLayout } from '../components/layout/dashboardLayout'
import { useAppTheme, themeSurfaces, type ThemeSurface } from '../theme/themeContext'
import { themePalettes } from '../theme/themePalettes'

const CARD = 'rounded-md bg-white p-4 shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

const isHexColor = (value: string) => /^#[\da-f]{6}$/i.test(value)

function SurfacePreview({
  surface,
  color,
  sidebarAppearance,
}: {
  surface: ThemeSurface
  color: string
  sidebarAppearance: 'light' | 'dark'
}) {
  if (surface === 'sidebarIndicator') {
    return (
      <div className="flex h-10 items-center gap-3 rounded bg-white text-xs text-gray-700">
        <span className="h-full w-1 rounded-l" style={{ backgroundColor: color }} />
        Active navigation item
      </div>
    )
  }
  if (surface === 'sidebarHighlight') {
    return (
      <div
        className="space-y-1 rounded p-2 text-xs"
        style={{
          backgroundColor: sidebarAppearance === 'dark' ? '#1f2937' : '#ffffff',
          color: sidebarAppearance === 'dark' ? '#e5e7eb' : '#4b5563',
        }}
      >
        <div
          className="rounded px-2 py-1"
          style={{ backgroundColor: color, color: 'var(--app-sidebar-highlight-text)' }}
        >
          Active navigation
        </div>
        <div
          className="rounded px-2 py-1"
          style={{ backgroundColor: color, color: 'var(--app-sidebar-highlight-text)' }}
        >
          Hovered navigation
        </div>
        <div className="px-2 py-1">Inactive navigation</div>
      </div>
    )
  }
  if (surface === 'primary') {
    return (
      <div className="flex h-10 items-center">
        <Button style={{ backgroundColor: color }}>Primary action</Button>
      </div>
    )
  }
  if (surface === 'loader') {
    return (
      <div className="flex h-10 items-center">
        <span
          className="h-7 w-7 animate-spin rounded-full border-[3px] border-gray-200"
          style={{ borderTopColor: color }}
          aria-label="Loader preview"
        />
      </div>
    )
  }
  return (
    <div className="rounded p-2" style={{ backgroundColor: color }}>
      <div className="rounded bg-white px-3 py-2 text-xs text-gray-700">Page content</div>
    </div>
  )
}

export function ThemeSettingsPage() {
  const {
    palette,
    setPaletteId,
    sidebarAppearance,
    setSidebarAppearance,
    surfaceColors,
    surfaceOverrides,
    setSurfaceColor,
    resetSurfaceColor,
    resetThemeCustomization,
  } = useAppTheme()
  const hasCustomColors =
    Object.keys(surfaceOverrides).length > 0 ||
    palette.id !== 'deep-teal' ||
    sidebarAppearance !== 'dark'

  return (
    <DashboardLayout
      title="Theme Settings"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Theme Settings' }]}
      subtitle="Manage the appearance of your workspace."
    >
      <div className="space-y-4">
        {/* section 1: the first white card takes the overlap with the header */}
        <section aria-labelledby="theme-presets-heading" className={CARD}>
          <div className="mb-4">
            <Text id="theme-presets-heading" size="md" fw={600}>
              Theme palettes
            </Text>
            <Text size="xs" c="dimmed">
              Pick a ready-made palette for the whole workspace.
            </Text>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {themePalettes.map((option) => {
              const isSelected = palette.id === option.id
              return (
                <ContentCard
                  key={option.id}
                  title={option.name}
                  className={isSelected ? 'ring-2 ring-brand' : ''}
                  action={
                    <Button
                      size="xs"
                      variant={isSelected ? 'light' : 'filled'}
                      aria-pressed={isSelected}
                      onClick={() => setPaletteId(option.id)}
                    >
                      {isSelected ? 'Current' : 'Use theme'}
                    </Button>
                  }
                >
                  <Text size="xs" c="dimmed" className="mb-3">
                    {option.description}
                  </Text>
                  <div className="grid grid-cols-5 gap-2">
                    {option.shades.map((shade, index) => (
                      <div key={shade} className="min-w-0 text-center">
                        <div
                          className="h-8 rounded"
                          style={{ backgroundColor: shade }}
                          aria-label={`${option.name} shade ${index + 1}: ${shade}`}
                          title={shade}
                        />
                        <Text size="xs" c="dimmed" className="mt-1">
                          {index + 1}
                        </Text>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              )
            })}
          </div>
        </section>

        {/* section 2 */}
        <section aria-labelledby="theme-customization-heading" className={CARD}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Text id="theme-customization-heading" size="md" fw={600}>
                Customize application colors
              </Text>
              <Text size="xs" c="dimmed">
                Preview where each color is used. Custom colors are saved on this device.
              </Text>
            </div>
            <Button variant="default" disabled={!hasCustomColors} onClick={resetThemeCustomization}>
              Reset all colors
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {themeSurfaces.map(({ id, label, description }) => (
              <ContentCard
                key={id}
                title={label}
                action={
                  surfaceOverrides[id] ? (
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      onClick={() => resetSurfaceColor(id)}
                      aria-label={`Reset ${label} color`}
                    >
                      Reset
                    </Button>
                  ) : undefined
                }
              >
                <Text size="xs" c="dimmed" className="mb-3 min-h-8">
                  {description}
                </Text>
                <div className="mb-3">
                  <SurfacePreview
                    surface={id}
                    color={surfaceColors[id]}
                    sidebarAppearance={sidebarAppearance}
                  />
                </div>
                {id === 'sidebarHighlight' && (
                  <SegmentedControl
                    fullWidth
                    size="xs"
                    value={sidebarAppearance}
                    onChange={(value) => {
                      if (value === 'light' || value === 'dark') setSidebarAppearance(value)
                    }}
                    data={[
                      { label: 'Light sidebar', value: 'light' },
                      { label: 'Dark sidebar', value: 'dark' },
                    ]}
                    className="mb-3"
                    aria-label="Sidebar appearance"
                  />
                )}
                <ColorInput
                  label={`${label} color`}
                  format="hex"
                  value={surfaceColors[id]}
                  onChange={(value) => {
                    if (isHexColor(value)) setSurfaceColor(id, value)
                  }}
                />
              </ContentCard>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}