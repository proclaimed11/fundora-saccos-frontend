import { AppIcon } from '../appIcon'
import { ActionIcon, Autocomplete } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import { navSections } from './navItems'

export function NavSearch({ onNavigate }: { onNavigate: (key: string) => void }) {
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const searchItems = navSections.flatMap((section) =>
    section.items.map((item) => ({ ...item, section: section.label })),
  )
  const suggestions = searchItems.map((item) => ({
    value: item.label,
    label: item.label,
  }))

  useEffect(() => {
    if (mobileOpen) {
      mobileInputRef.current?.focus()
    }
  }, [mobileOpen])

  const selectSuggestion = (label: string) => {
    const item = searchItems.find((candidate) => candidate.label === label)
    if (item) {
      setQuery('')
      setMobileOpen(false)
      onNavigate(item.key)
    }
  }

  const renderOption = ({ option }: { option: { value: string } }) => {
    const item = searchItems.find((candidate) => candidate.label === option.value)
    return (
      <div className="flex items-center gap-2">
        {item && <AppIcon name={item.icon} size={14} className="shrink-0 text-gray-500" />}
        <span className="flex-1">{item?.label ?? option.value}</span>
        {item && <span className="text-xs text-gray-400">{item.section}</span>}
      </div>
    )
  }

  return (
    <>
      <Autocomplete
        aria-label="Search pages"
        placeholder="Search or jump to…"
        value={query}
        onChange={setQuery}
        data={suggestions}
        dropdownOpened={query.trim().length > 0}
        limit={6}
        maxDropdownHeight={320}
        onOptionSubmit={selectSuggestion}
        renderOption={renderOption}
        leftSection={<AppIcon name="search" size={14} strokeWidth={1.5} />}
        size="xs"
        radius="md"
        className="hidden w-72 max-w-[28vw] md:block"
        classNames={{
          input:
            'border-0 bg-white/15 text-white placeholder:text-white/70 hover:bg-white/20 focus:bg-white/20',
          dropdown: 'z-50',
        }}
        styles={{
          input: { backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white' },
          section: { color: 'rgba(255, 255, 255, 0.8)' },
        }}
      />
      <div className="flex min-w-0 items-center md:hidden">
        <div
          className="overflow-hidden transition-[width,opacity] duration-200 ease-out"
          style={{
            width: mobileOpen ? 'min(14rem, 55vw)' : 0,
            opacity: mobileOpen ? 1 : 0,
          }}
          aria-hidden={!mobileOpen}
        >
          <Autocomplete
            ref={mobileInputRef}
            aria-label="Search pages"
            disabled={!mobileOpen}
            placeholder="Search…"
            value={query}
            onChange={setQuery}
            data={suggestions}
            dropdownOpened={mobileOpen && query.trim().length > 0}
            limit={6}
            maxDropdownHeight={320}
            onOptionSubmit={selectSuggestion}
            renderOption={renderOption}
            leftSection={<AppIcon name="search" size={14} strokeWidth={1.5} />}
            size="xs"
            radius="md"
            className="w-56"
            classNames={{
              input:
                'border-0 bg-white/15 text-white placeholder:text-white/70 hover:bg-white/20 focus:bg-white/20',
              dropdown: 'z-50',
            }}
            styles={{
              input: { backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white' },
              section: { color: 'rgba(255, 255, 255, 0.8)' },
            }}
          />
        </div>
        <ActionIcon
          variant="subtle"
          size="lg"
          className="shrink-0 text-white hover:bg-white/15"
          aria-label={mobileOpen ? 'Close search' : 'Search'}
          onClick={() => {
            setMobileOpen((open) => !open)
            if (mobileOpen) {
              setQuery('')
            }
          }}
        >
          <AppIcon name="search" size={18} strokeWidth={1.5} />
        </ActionIcon>
      </div>
    </>
  )
}