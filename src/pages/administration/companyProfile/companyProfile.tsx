import { AppIcon } from '../../../components/appIcon'
import { useEffect, useState } from 'react'
import { Alert, Button, Select, SimpleGrid, Text, TextInput, Textarea } from '@mantine/core'
import { DashboardLayout } from '../../../components/layout/dashboardLayout'
import logo from '../../../assets/logo.png'
import { CURRENCIES, EMAIL, LANGUAGES, SAMPLE_PROFILE, isPhone, type CompanyProfile } from './companyProfileData'

const CARD = 'rounded-md bg-white shadow-[0_10px_30px_rgba(76,87,125,0.12)]'

type Values = Omit<CompanyProfile, 'id'>
type Errors = Partial<Record<keyof Values, string>>
type Notice = { text: string; color: 'green' | 'blue' } | null

const toValues = ({ id: _id, ...rest }: CompanyProfile): Values => rest

function SectionTitle({ children }: { children: string }) {
  return (
    <Text size="sm" fw={600} mb={4}>
      {children}
    </Text>
  )
}

export function CompanyProfilePage() {
  // UI only: the saved profile changes for this session, nothing is stored yet
  const [saved, setSaved] = useState<CompanyProfile>(SAMPLE_PROFILE)
  const [values, setValues] = useState<Values>(toValues(SAMPLE_PROFILE))
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState<Notice>(null)

  // success banners fade away on their own
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const dirty = JSON.stringify(values) !== JSON.stringify(toValues(saved))

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const text = (key: 'companyName' | 'email' | 'phone' | 'location' | 'contractTitle') => ({
    size: 'sm' as const,
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.currentTarget.value),
    error: errors[key],
  })

  const discard = () => {
    setValues(toValues(saved))
    setErrors({})
  }

  const save = () => {
    const found: Errors = {}
    if (!values.companyName.trim()) found.companyName = 'Enter the company name'
    if (!values.email.trim()) found.email = 'Enter an email address'
    else if (!EMAIL.test(values.email.trim())) found.email = 'Enter a valid email address'
    if (!values.phone.trim()) found.phone = 'Enter a phone number'
    else if (!isPhone(values.phone.trim())) found.phone = 'Use +255 700 000 000 or 0700000000'
    if (!values.location.trim()) found.location = 'Enter the location'
    if (!values.currency) found.currency = 'Select the currency'
    if (!values.language) found.language = 'Select the language'
    if (!values.contractTitle.trim()) found.contractTitle = 'Enter the contract title'
    if (!values.emailMessage.trim()) found.emailMessage = 'Enter the email message'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    // TODO: PUT /api/company-profiles/{id} { companyName, email, phone, location, currency, language }
    const next: CompanyProfile = {
    id: saved.id,
    companyName: values.companyName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    location: values.location.trim(),
    currency: values.currency,
    language: values.language,
    contractTitle: values.contractTitle.trim(),
    emailMessage: values.emailMessage.trim(),
    }
    setSaved(next)
    setValues(toValues(next))
    setNotice({ color: 'green', text: 'The company profile was saved. New contracts and notices use these details.' })
  }

  // the preview follows what is typed, with a fallback while a field is empty
  const name = values.companyName.trim() || 'Company name'
  const email = values.email.trim() || 'email'
  const phone = values.phone.trim() || 'phone'
  const location = values.location.trim() || 'location'

  return (
    <DashboardLayout
      title="Company Profile"
      subtitle="The company details printed on contracts and sent in notices"
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Administration' }, { label: 'Company Profile' }]}
    >
      <div className="space-y-4">
        {notice && (
          <Alert
            color={notice.color}
            variant="light"
            withCloseButton
            onClose={() => setNotice(null)}
            icon={<AppIcon name="circle-check" />}
          >
            <Text size="sm">{notice.text}</Text>
          </Alert>
        )}

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* the form */}
          <div className={`${CARD} p-5`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-subtle text-brand-dark">
                <AppIcon name="building-2" size={20} strokeWidth={1.25} />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-800">{saved.companyName}</div>
                <div className="text-xs text-gray-500">{dirty ? 'You have unsaved changes' : 'All changes saved'}</div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <SectionTitle>Business details</SectionTitle>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput label="Company name" placeholder="Fundora Credit Solutions" {...text('companyName')} />
                  <TextInput label="Location" placeholder="Dar es Salaam, Tanzania" {...text('location')} />
                </SimpleGrid>
              </div>

              <div>
                <SectionTitle>Contact</SectionTitle>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    label="Email"
                    description="Shown to borrowers on notices"
                    placeholder="support@fundora.co.tz"
                    leftSection={<AppIcon name="mail" />}
                    {...text('email')}
                  />
                  <TextInput
                    label="Phone"
                    placeholder="+255 700 000 000"
                    inputMode="tel"
                    leftSection={<AppIcon name="phone" />}
                    {...text('phone')}
                  />
                </SimpleGrid>
              </div>

              <div>
                <SectionTitle>Document wording</SectionTitle>
                <div className="space-y-3">
                    <TextInput
                    label="Contract title"
                    description="The heading printed at the top of every loan contract"
                    placeholder="LOAN AGREEMENT"
                    {...text('contractTitle')}
                    />
                    <Textarea
                    label="Email message"
                    description="The message borrowers get when a contract is sent to them"
                    size="sm"
                    autosize
                    minRows={2}
                    value={values.emailMessage}
                    onChange={(e) => set('emailMessage', e.currentTarget.value)}
                    error={errors.emailMessage}
                    />
                </div>
                </div>

              <div>
                <SectionTitle>Regional settings</SectionTitle>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Select
                    label="Currency"
                    size="sm"
                    data={CURRENCIES}
                    allowDeselect={false}
                    value={values.currency}
                    onChange={(v) => v && set('currency', v)}
                    error={errors.currency}
                  />
                  <Select
                    label="Language"
                    size="sm"
                    data={LANGUAGES}
                    allowDeselect={false}
                    value={values.language}
                    onChange={(v) => v && set('language', v)}
                    error={errors.language}
                  />
                </SimpleGrid>
                {(values.currency !== 'TZS' || values.language !== 'English') && (
                  <Alert color="yellow" variant="light" icon={<AppIcon name="triangle-alert" />} mt="sm">
                    <Text size="xs">
                      The screens still show amounts in TZS and text in English. These two settings are saved on the
                      profile, but the interface does not follow them yet.
                    </Text>
                  </Alert>
                )}
              </div>

              <div>
                <SectionTitle>Logo</SectionTitle>
                <div className="flex items-center gap-4 rounded-md border border-gray-200 px-4 py-3">
                  <img src={logo} alt="Company logo" className="h-12 w-32 object-cover" />
                  <Text size="xs" c="dimmed">
                    The logo is part of the app files today. The profile has no logo field yet, so it cannot be changed
                    here.
                  </Text>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
              <Button size="xs" variant="default" disabled={!dirty} onClick={discard}>
                Discard changes
              </Button>
              <Button size="xs" disabled={!dirty} leftSection={<AppIcon name="check" />} onClick={save}>
                Save changes
              </Button>
            </div>
          </div>

          {/* where it appears, follows the form as you type */}
          <div className="space-y-4">
            <div className={`${CARD} p-4`}>
              <SectionTitle>On a loan contract</SectionTitle>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="bg-white p-4 text-center font-serif shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{name}</div>
                  <div className="mt-1 text-base font-bold tracking-wide text-gray-900">
                    {values.contractTitle.trim() || 'LOAN AGREEMENT'}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">Contract No. CT-0000000000000</div>
                  <div className="mt-3 border-t border-gray-200 pt-2 text-[11px] text-gray-500">
                    {location} · {phone} · {email}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${CARD} p-4`}>
              <SectionTitle>In an email to a borrower</SectionTitle>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="rounded bg-white p-4 text-xs text-gray-700 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
                  <div className="font-medium text-gray-800">Loan contract ready for download</div>
                  <p className="mt-2 whitespace-pre-line">{values.emailMessage.trim() || 'Email message'}</p>
                  <div className="mt-3 border-t border-gray-200 pt-2 text-[11px] text-gray-500">
                    <div className="font-medium text-gray-700">{name}</div>
                    <div>{location}</div>
                    <div>
                      {phone} · {email}
                    </div>
                  </div>
                </div>
              </div>
              <Text size="xs" c="dimmed" mt="xs">
                Currency: {values.currency} · Language: {values.language}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}