import { Text } from '@mantine/core'
import { ContentCard } from '../components/contentCard'
import { DashboardLayout } from '../components/layout/dashboardLayout'

export function ThemeSettingsPage() {
  return (
    <DashboardLayout
      title="Theme Settings"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Theme Settings' }]}
      subtitle="Manage the appearance of your workspace."
    >
      <ContentCard title="Appearance">
        <Text size="sm" c="dimmed">
          Theme customization options will be available here.
        </Text>
      </ContentCard>
    </DashboardLayout>
  )
}
