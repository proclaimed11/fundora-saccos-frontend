type CsvColumn<T> = {
  header: string
  accessor: (row: T) => string | number
}

const escapeCsvValue = (value: string | number) => {
  const stringValue = String(value)
  // Wrap in quotes if it contains a comma, quote, or newline; escape inner quotes
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function exportToCsv<T>(rows: T[], columns: CsvColumn<T>[], filename: string) {
  const header = columns.map((col) => escapeCsvValue(col.header)).join(",")
  const body = rows
    .map((row) => columns.map((col) => escapeCsvValue(col.accessor(row))).join(","))
    .join("\n")

  const csvContent = `${header}\n${body}`
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}