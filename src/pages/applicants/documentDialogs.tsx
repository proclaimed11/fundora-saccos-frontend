import { AppIcon } from '../../components/appIcon'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Alert, Button, FileInput, Modal, Select, Text, Textarea } from '@mantine/core'
import { DOCUMENT_TYPES, type ApplicantDocument } from './applicantsData'

export const sizeText = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`)
export const isImage = (name: string) => /\.(jpe?g|png|gif|webp)$/i.test(name)

/* ---------- upload / replace ---------- */

export type DocumentInput = { type: string; fileName: string; sizeKb: number; notes: string; file: File | null }

type Props = {
  opened: boolean
  /** null means a new document is being uploaded, otherwise its file is being replaced */
  document: ApplicantDocument | null
  /** types already on the applicant, only "Other" can be added more than once */
  existingTypes: string[]
  onClose: () => void
  onSubmit: (input: DocumentInput) => void
}

type Errors = Partial<Record<'type' | 'file', string>>

export function DocumentDialog({ opened, document, existingTypes, onClose, onSubmit }: Props) {
  const replacing = document !== null
  const [type, setType] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (!opened) return
    setType(document?.type ?? null)
    setFile(null)
    setNotes(document?.notes ?? '')
    setErrors({})
  }, [opened, document])

  const submit = () => {
    const found: Errors = {}
    if (!type) found.type = 'Select the document type'
    else if (!replacing && type !== 'Other' && existingTypes.includes(type)) {
      found.type = `A ${type} is already uploaded. Use Replace on it instead.`
    }
    if (!file) found.file = 'Choose the file to upload'

    setErrors(found)
    if (Object.keys(found).length > 0 || !type || !file) return

    // TODO: POST /api/applicant-documents, or PUT /api/applicant-documents/{id} when replacing.
    //       The file upload is not in the API yet, only a file path is saved.
        onSubmit({ type, fileName: file.name, sizeKb: file.size / 1024, notes: notes.trim(), file })
  }

  return (
    <Modal opened={opened} onClose={onClose} title={replacing ? 'Replace document' : 'Upload document'} centered>
      <div className="space-y-4">
        <Select
          label="Document type"
          placeholder="Select type"
          size="sm"
          data={DOCUMENT_TYPES}
          allowDeselect={false}
          disabled={replacing}
          value={type}
          onChange={(v) => {
            setType(v)
            setErrors((e) => ({ ...e, type: undefined }))
          }}
          error={errors.type}
        />

        <FileInput
          label={replacing ? 'New file' : 'File'}
          description={replacing ? `Replaces ${document.fileName}` : 'PDF or image'}
          placeholder="Upload PDF or image"
          size="sm"
          accept="application/pdf,image/*"
          clearable
          leftSection={<AppIcon name="upload" />}
          value={file}
          onChange={(f) => {
            setFile(f)
            setErrors((e) => ({ ...e, file: undefined }))
          }}
          error={errors.file}
        />

        <Textarea
          label="Notes (optional)"
          size="sm"
          autosize
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />

        <div className="flex justify-end gap-2">
          <Button size="xs" variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button size="xs" leftSection={<AppIcon name="upload" />} onClick={submit}>
            {replacing ? 'Replace' : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- view ---------- */

export function DocumentPreview({ document, onClose }: { document: ApplicantDocument | null; onClose: () => void }) {
  return (
    <Modal opened={!!document} onClose={onClose} title={document?.type ?? ''} size="lg" centered>
      {document && (
        <div className="space-y-4">
          <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-md bg-gray-50 text-center">
            <AppIcon name={isImage(document.fileName) ? 'file-image' : 'file-text'} className="text-gray-300" size={36} />
            <Text size="sm" c="dimmed">
              The preview appears here once files are connected.
            </Text>
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500">
            <span>
              {document.fileName} · {sizeText(document.sizeKb)}
            </span>
            <span>
              Uploaded {dayjs(document.uploaded).format('MMM D, YYYY')} by {document.uploadedBy}
            </span>
          </div>
          {document.notes && (
            <Alert color="gray" variant="light" icon={<AppIcon name="info" />}>
              <Text size="xs">{document.notes}</Text>
            </Alert>
          )}
        </div>
      )}
    </Modal>
  )
}