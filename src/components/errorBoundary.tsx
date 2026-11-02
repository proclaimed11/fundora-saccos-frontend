import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mantine/core'
import { AppIcon } from './appIcon'
import { ErrorPage } from '../pages/errors/errorPage'

function Fallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const navigate = useNavigate()

  return (
    <ErrorPage
      code="500"
      icon="triangle-alert"
      title="Something went wrong"
      message={`This page hit an unexpected problem. Your saved data is not affected. Try again, or go back to the dashboard.${
        import.meta.env.DEV ? ` (${error.message})` : ''
      }`}
    >
      <Button variant="default" leftSection={<AppIcon name="refresh-cw" />} onClick={onReset}>
        Try again
      </Button>
      <Button
        leftSection={<AppIcon name="home" />}
        onClick={() => {
          onReset()
          navigate('/')
        }}
      >
        Go to dashboard
      </Button>
    </ErrorPage>
  )
}

type Props = {
  children: ReactNode
  /** when this changes (a new page) the error is cleared */
  resetKey?: string
}

type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: send this to the audit log or an error service
    console.error('Page crashed:', error, info.componentStack)
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  reset = () => this.setState({ error: null })

  render() {
    return this.state.error ? <Fallback error={this.state.error} onReset={this.reset} /> : this.props.children
  }
}