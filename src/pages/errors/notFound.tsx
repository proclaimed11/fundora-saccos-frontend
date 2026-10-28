import { useNavigate } from 'react-router-dom'
import { Button } from '@mantine/core'
import { AppIcon } from '../../components/appIcon'
import { ErrorPage } from './errorPage'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <ErrorPage
      code="404"
      icon="search"
      title="Page not found"
      message="The page you are looking for does not exist or was moved. Check the address, or go back to where you were."
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