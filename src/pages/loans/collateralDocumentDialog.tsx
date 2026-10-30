import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import { Alert, Button, FileInput, Modal, Text } from '@mantine/core'

type Props = {
  opened: boolean
  /** what the document belongs to, for example "Land: Plot 214" */
  subject: string
  /** the file name being replaced, null when there is none yet */
  current: string | null
  onClose: () => void
  onSubmit: (file: File) => void
}

export function CollateralDocumentDialog({ opened, subject, current, onClose, onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!opened) return
    setFile(null)
    setError(undefined)
  }, [opened])

  const submit = () => {
    if (!file) {
      setError('Choose the file to upload')
      return
    }
    // TODO: POST /api/collateral-documents (raw CRUD) { collateralId, ... }
    //       The file upload is not in the API yet, only a file path is saved.
    onSubmit(file)
  }

  return (
    <Modal opened={opened} onClose={onClose} title={current ? 'Replace document' : 'Upload document'} centered>
      <div className="space-y-4">
        <Text size="sm">
          {current ? 'Replace the document of' : 'Add a document to'} <span className="font-medium">{subject}</span>.
        </Text>

        <FileInput
          label={current ? 'New file' : 'File'}
          description={current ? `Replaces ${current}` : 'A title deed, ownership papers or a valuation report'}
          placeholder="Upload PDF or image"
          size="sm"
          accept="application/pdf,image/*"
          clearable
          leftSection={<AppIcon name="upload" />}
          value={file}
          onChange={(f) => {
            setFile(f)
            setError(undefined)
          }}
          error={error}
        />

        <Alert color="blue" variant="light" icon={<AppIcon name="info" />}>
          <Text size="xs">The previous file is replaced, so keep a copy if it is still needed.</Text>
        </Alert>

        <div className="flex justify-end gap-2">
          <Button size="xs" variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="upload" />} onClick={submit}>
            {current ? 'Replace' : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}