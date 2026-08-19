import type { Result, ToolConfig, Values } from '@/lib/tool-config'

// 公式與來源見 specs/tools.md #2

function compute(values: Values): Result {
  const invoiceAmount = Number(values.invoiceAmount)
  const daysLate = Number(values.daysLate)
  const rateType = String(values.rateType)
  const ratePct = Number(values.ratePct)
  const flatFee = Number(values.flatFee)

  const dailyRate = rateType === 'monthly' ? ratePct / 100 / 30 : ratePct / 100 / 365
  const interest = invoiceAmount * dailyRate * daysLate
  const total = invoiceAmount + interest + flatFee
  const effectiveAnnualPct = dailyRate * 365 * 100

  return {
    interest,
    total,
    effectiveAnnualPct,
  }
}

const config: ToolConfig = {
  slug: 'late-fee',
  name: 'Invoice Late Fee Calculator',
  description: 'Calculate the interest and total amount owed on a late invoice payment.',
  category: 'FinanceApplication',

  inputs: [
    { key: 'invoiceAmount', label: 'Invoice amount', type: 'number', default: 2500, min: 0, unit: 'USD' },
    { key: 'daysLate', label: 'Days late', type: 'number', default: 30, min: 0, unit: 'days' },
    {
      key: 'rateType',
      label: 'Rate type',
      type: 'select',
      default: 'monthly',
      options: [
        { value: 'monthly', label: '% per month' },
        { value: 'annual', label: '% per year' },
      ],
    },
    { key: 'ratePct', label: 'Late fee rate', type: 'number', default: 1.5, min: 0, step: 0.1, unit: '%' },
    { key: 'flatFee', label: 'Flat fee', type: 'number', default: 0, min: 0, unit: 'USD' },
  ],

  compute,

  outputs: [
    { type: 'stat', key: 'interest', label: 'Interest owed', format: 'currency', decimals: 2 },
    { type: 'stat', key: 'total', label: 'Total amount owed', format: 'currency', decimals: 2 },
    { type: 'stat', key: 'effectiveAnnualPct', label: 'Effective annual rate', format: 'percent', decimals: 1 },
    { type: 'note', text: 'Check your contract and local law for maximum allowed rates. Not legal advice.' },
  ],

  cta: {
    href: '/tools/hourly-rate',
    label: 'See how it affects your rate →',
  },

  faq: [
    {
      question: 'What late fee rate should I put in my contract?',
      answer:
        '1–1.5% per month (about 12–18% annualized) is a common range for freelance and small-business invoices, but check whether your state caps late fee or interest rates before you set one.',
    },
    {
      question: 'Can I charge both a flat fee and interest?',
      answer:
        'Yes, as long as your contract clearly states both — this tool lets you combine a flat fee with the interest rate in the same calculation.',
    },
    {
      question: 'Is this compound or simple interest?',
      answer:
        'Simple interest, calculated daily against the original invoice amount — it does not compound (interest does not earn additional interest).',
    },
  ],
}

export default config
