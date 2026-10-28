import { useRef } from 'react'
import { ActionIcon, Button, Select, Text, TextInput, Textarea } from '@mantine/core'
import { AppIcon } from '../../components/appIcon'
import { PLACEHOLDERS, type ContractContent } from './contractTemplate'

type Props = {
  draft: ContractContent
  onChange: (next: ContractContent) => void
}

const FIELD_OPTIONS = PLACEHOLDERS.map((p) => ({ value: p.key, label: p.label }))

export function ContractEditor({ draft, onChange }: Props) {
  // the text boxes, so a field is inserted where the cursor is
  const boxes = useRef<Record<number, HTMLTextAreaElement | null>>({})

  const patch = (id: number, change: { title?: string; body?: string }) =>
    onChange({ ...draft, clauses: draft.clauses.map((c) => (c.id === id ? { ...c, ...change } : c)) })

  const move = (index: number, step: -1 | 1) => {
    const list = [...draft.clauses]
    const j = index + step
    if (j < 0 || j >= list.length) return
    ;[list[index], list[j]] = [list[j], list[index]]
    onChange({ ...draft, clauses: list })
  }

  const remove = (id: number) => onChange({ ...draft, clauses: draft.clauses.filter((c) => c.id !== id) })

  const add = () => {
    const id = Math.max(0, ...draft.clauses.map((c) => c.id)) + 1
    onChange({ ...draft, clauses: [...draft.clauses, { id, title: '', body: '' }] })
  }

  const insert = (id: number, key: string) => {
    const clause = draft.clauses.find((c) => c.id === id)
    if (!clause) return
    const at = boxes.current[id]?.selectionStart ?? clause.body.length
    patch(id, { body: `${clause.body.slice(0, at)}{{${key}}}${clause.body.slice(at)}` })
  }

  return (
    <div className="space-y-4">
      <Text size="xs" c="dimmed">
        Use fields like {'{{principal}}'} for values that come from the application, they are filled in
        automatically. Put **double asterisks** around words to make them bold.
      </Text>

      <TextInput
        label="Contract heading"
        size="sm"
        value={draft.title}
        onChange={(e) => onChange({ ...draft, title: e.currentTarget.value })}
      />

      {draft.clauses.map((c, i) => (
        <div key={c.id} className="rounded-md border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Text size="sm" fw={600}>
              Clause {i + 1}
            </Text>
            <div className="flex items-center gap-1">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                disabled={i === 0}
                aria-label={`Move clause ${i + 1} up`}
                onClick={() => move(i, -1)}
              >
                <AppIcon name="arrow-up" />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                disabled={i === draft.clauses.length - 1}
                aria-label={`Move clause ${i + 1} down`}
                onClick={() => move(i, 1)}
              >
                <AppIcon name="arrow-down" />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                aria-label={`Delete clause ${i + 1}`}
                onClick={() => remove(c.id)}
              >
                <AppIcon name="trash" />
              </ActionIcon>
            </div>
          </div>

          <div className="space-y-2">
            <TextInput
              aria-label={`Clause ${i + 1} title`}
              placeholder="Clause title"
              size="sm"
              value={c.title}
              onChange={(e) => patch(c.id, { title: e.currentTarget.value })}
            />
            <Textarea
              aria-label={`Clause ${i + 1} text`}
              placeholder="What this clause says"
              size="sm"
              autosize
              minRows={3}
              ref={(el) => {
                boxes.current[c.id] = el
              }}
              value={c.body}
              onChange={(e) => patch(c.id, { body: e.currentTarget.value })}
            />
            <Select
              aria-label={`Insert a field into clause ${i + 1}`}
              placeholder="Insert a field at the cursor"
              size="xs"
              searchable
              data={FIELD_OPTIONS}
              value={null}
              onChange={(v) => v && insert(c.id, v)}
            />
          </div>
        </div>
      ))}

      <Button type="button" size="xs" variant="default" leftSection={<AppIcon name="plus" />} onClick={add}>
        Add clause
      </Button>
    </div>
  )
}