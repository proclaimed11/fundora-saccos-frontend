import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    marginBottom: 4,
  },
  lenderName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  lenderLine: {
    marginBottom: 2,
    color: "#333333",
  },
  docTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 2,
    width: 220,
  },
  metaLabel: {
    color: "#555555",
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    marginBottom: 14,
  },
  intro: {
    marginBottom: 16,
    lineHeight: 1.5,
    color: "#222222",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cellLabel: {
    width: "30%",
    padding: 8,
    color: "#333333",
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
    backgroundColor: "#fafafa",
  },
  cellValue: {
    width: "70%",
    padding: 8,
    fontFamily: "Helvetica-Bold",
  },
  twoTables: {
    flexDirection: "row",
    gap: 16,
  },
  halfTable: {
    flex: 1,
  },
  termsItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  termsNo: {
    width: 28,
    fontFamily: "Helvetica-Bold",
  },
  termsText: {
    flex: 1,
    lineHeight: 1.4,
  },
  scheduleTable: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
  },
  scheduleHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#d9d9d9",
  },
  scheduleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  scheduleCell: {
    flex: 1,
    padding: 6,
    textAlign: "center",
  },
  scheduleHeaderCell: {
    flex: 1,
    padding: 6,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: "#555555",
  },
  note: {
    marginTop: 6,
    fontSize: 8,
    fontStyle: "italic",
    color: "#666666",
  },
  signaturesRow: {
    flexDirection: "row",
    gap: 40,
    marginTop: 24,
  },
  signatureCol: {
    flex: 1,
  },
  signatureLabel: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 24,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    marginBottom: 6,
    height: 18,
  },
  signatureField: {
    flexDirection: "row",
    marginBottom: 10,
  },
  signatureFieldLabel: {
    width: 80,
  },
  signatureFieldLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#999999",
  },
})

export type LoanContractData = {
  lender: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    tin: string
    vrn: string
  }
  contract: {
    contractNo: string
    applicationNo: string
    dateGenerated: string
    status: string
  }
  borrower: {
    fullName: string
    address: string
    phone: string
    email: string
    dateOfBirth: string
    occupation: string
    idNumber: string
  }
  loan: {
    loanType: string
    loanAmount: string
    interestRate: string
    interestMethod: string
    repaymentMethod: string
    tenure: string
    repaymentFrequency: string
    firstRepaymentDate: string
    disbursementMethod: string
    purpose: string
  }
  repaymentSummary: {
    principalAmount: string
    totalInterest: string
    totalRepayableAmount: string
  }
  schedule: { installmentNo: string; dueDate: string; principal: string; interest: string; total: string }[]
}

const termsAndConditions = [
  "The Borrower acknowledges receipt of the loan amount and agrees to use the loan only for the stated purpose.",
  "The Borrower agrees to repay the loan in accordance with the repayment schedule provided by the Lender.",
  "All repayments shall be made on or before the due dates. Late payments may attract penalties and additional charges.",
  "The Lender reserves the right to declare the entire outstanding balance due and payable in case of default.",
  "The Borrower agrees to provide accurate information and notify the Lender of any material changes.",
  "This contract is governed by the laws of the United Republic of Tanzania.",
]

type LoanContractDocumentProps = {
  data: LoanContractData
}

const LoanContractDocument = ({ data }: LoanContractDocumentProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.lenderName}>{data.lender.name.toUpperCase()}</Text>
            <Text style={styles.lenderLine}>{data.lender.address}</Text>
            <Text style={styles.lenderLine}>Phone: {data.lender.phone}</Text>
            <Text style={styles.lenderLine}>Email: {data.lender.email}</Text>
            <Text style={styles.lenderLine}>Website: {data.lender.website}</Text>
            <Text style={styles.lenderLine}>
              TIN: {data.lender.tin}    |    VRN: {data.lender.vrn}
            </Text>
          </View>
          <View>
            <Text style={styles.docTitle}>LOAN CONTRACT</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Contract No.</Text>
              <Text style={styles.metaValue}>{data.contract.contractNo}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Application No.</Text>
              <Text style={styles.metaValue}>{data.contract.applicationNo}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date Generated</Text>
              <Text style={styles.metaValue}>{data.contract.dateGenerated}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Contract Status</Text>
              <Text style={styles.metaValue}>{data.contract.status}</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />

        <Text style={styles.intro}>
          This Loan Contract is made on this {data.contract.dateGenerated} between {data.lender.name} (hereinafter
          referred to as "the Lender") and the undersigned Borrower (hereinafter referred to as "the Borrower").
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. BORROWER INFORMATION</Text>
          <View style={styles.table}>
            {[
              ["Full Name", data.borrower.fullName],
              ["Address", data.borrower.address],
              ["Phone", data.borrower.phone],
              ["Email", data.borrower.email],
              ["Date of Birth", data.borrower.dateOfBirth],
              ["Occupation", data.borrower.occupation],
              ["National ID / Passport", data.borrower.idNumber],
            ].map(([label, value], idx, arr) => (
              <View key={label} style={idx === arr.length - 1 ? [styles.row, styles.rowLast] : styles.row}>
                <Text style={styles.cellLabel}>{label}</Text>
                <Text style={styles.cellValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. LOAN DETAILS</Text>
          <View style={styles.twoTables}>
            <View style={[styles.table, styles.halfTable]}>
              {[
                ["Loan Type", data.loan.loanType],
                ["Loan Amount", data.loan.loanAmount],
                ["Interest Rate", data.loan.interestRate],
                ["Interest Method", data.loan.interestMethod],
                ["Repayment Method", data.loan.repaymentMethod],
              ].map(([label, value], idx, arr) => (
                <View key={label} style={idx === arr.length - 1 ? [styles.row, styles.rowLast] : styles.row}>
                  <Text style={styles.cellLabel}>{label}</Text>
                  <Text style={styles.cellValue}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.table, styles.halfTable]}>
              {[
                ["Tenure", data.loan.tenure],
                ["Repayment Frequency", data.loan.repaymentFrequency],
                ["First Repayment Date", data.loan.firstRepaymentDate],
                ["Disbursement Method", data.loan.disbursementMethod],
                ["Purpose of Loan", data.loan.purpose],
              ].map(([label, value], idx, arr) => (
                <View key={label} style={idx === arr.length - 1 ? [styles.row, styles.rowLast] : styles.row}>
                  <Text style={styles.cellLabel}>{label}</Text>
                  <Text style={styles.cellValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. REPAYMENT SUMMARY</Text>
          <View style={styles.table}>
            {[
              ["Principal Amount", data.repaymentSummary.principalAmount],
              ["Total Interest", data.repaymentSummary.totalInterest],
              ["Total Repayable Amount", data.repaymentSummary.totalRepayableAmount],
            ].map(([label, value], idx, arr) => (
              <View key={label} style={idx === arr.length - 1 ? [styles.row, styles.rowLast] : styles.row}>
                <Text style={styles.cellLabel}>{label}</Text>
                <Text style={styles.cellValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. TERMS AND CONDITIONS</Text>
          {termsAndConditions.map((term, idx) => (
            <View key={term} style={styles.termsItem}>
              <Text style={styles.termsNo}>4.{idx + 1}</Text>
              <Text style={styles.termsText}>{term}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section} break={data.schedule.length > 6}>
          <Text style={styles.sectionTitle}>5. REPAYMENT SCHEDULE SUMMARY</Text>
          <View style={styles.scheduleTable}>
            <View style={styles.scheduleHeaderRow}>
              <Text style={styles.scheduleHeaderCell}>Installment No.</Text>
              <Text style={styles.scheduleHeaderCell}>Due Date</Text>
              <Text style={styles.scheduleHeaderCell}>Principal (TZS)</Text>
              <Text style={styles.scheduleHeaderCell}>Interest (TZS)</Text>
              <Text style={styles.scheduleHeaderCell}>Total (TZS)</Text>
            </View>
            {data.schedule.map((row) => (
              <View key={row.installmentNo} style={styles.scheduleRow}>
                <Text style={styles.scheduleCell}>{row.installmentNo}</Text>
                <Text style={styles.scheduleCell}>{row.dueDate}</Text>
                <Text style={styles.scheduleCell}>{row.principal}</Text>
                <Text style={styles.scheduleCell}>{row.interest}</Text>
                <Text style={styles.scheduleCell}>{row.total}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>Note: This is a summary. Full repayment schedule is provided separately.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. SIGNATURES</Text>
          <Text>
            By signing below, the parties acknowledge that they have read, understood, and agree to the terms and
            conditions of this Loan Contract.
          </Text>

          <View style={styles.signaturesRow}>
            <View style={styles.signatureCol}>
              <Text style={styles.signatureLabel}>For and on behalf of {data.lender.name}</Text>
              <View style={styles.signatureLine} />
              <View style={styles.signatureField}>
                <Text style={styles.signatureFieldLabel}>Name:</Text>
                <View style={styles.signatureFieldLine} />
              </View>
              <View style={styles.signatureField}>
                <Text style={styles.signatureFieldLabel}>Designation:</Text>
                <View style={styles.signatureFieldLine} />
              </View>
              <View style={styles.signatureField}>
                <Text style={styles.signatureFieldLabel}>Date:</Text>
                <View style={styles.signatureFieldLine} />
              </View>
            </View>

            <View style={styles.signatureCol}>
              <Text style={styles.signatureLabel}>Borrower</Text>
              <View style={styles.signatureLine} />
              <View style={styles.signatureField}>
                <Text style={styles.signatureFieldLabel}>Name:</Text>
                <View style={styles.signatureFieldLine} />
              </View>
              <View style={styles.signatureField}>
                <Text style={styles.signatureFieldLabel}>ID Number:</Text>
                <View style={styles.signatureFieldLine} />
              </View>
              <View style={styles.signatureField}>
                <Text style={styles.signatureFieldLabel}>Date:</Text>
                <View style={styles.signatureFieldLine} />
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default LoanContractDocument