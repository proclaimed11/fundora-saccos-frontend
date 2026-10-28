import { useNavigate } from 'react-router-dom'
import { Button } from '@mantine/core'
import { AppIcon } from '../../components/appIcon'
import { ErrorPage } from './errorPage'

export function NoAccess() {
  const navigate = useNavigate()

  return (
    <ErrorPage
      code="403"
      icon="lock-keyhole"
      title="You do not have access"
      message="Your role does not allow you to open this page. If you think this is a mistake, ask an Admin to check your role on the Users page."
    >
      <Button variant="default" leftSection={<AppIcon name="arrow-left" />} onClick={() => navigate(-1)}>
        Go back
      </Button>
      <Button leftSection={<AppIcon name="home" />} onClick={() => navigate('/')}>
        Go to dashboard
      </Button>
    </ErrorPage>
  )
}