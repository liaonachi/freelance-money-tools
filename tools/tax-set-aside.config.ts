import type { Result, ResultRow, ToolConfig, Values } from '@/lib/tool-config'

// 公式與來源見 specs/tools.md #3

function compute(values: Values): Result {
  const monthlyIncome = Number(values.monthlyIncome)
  const federalPct = Number(values.federalPct)
  const statePct = Number(values.statePct)
  const includeSelfEmploymentTax = Boolean(values.includeSelfEmploymentTax)

  const seTaxable = monthlyIncome * 0.9235
  const seTax = includeSelfEmploymentTax ? seTaxable * 0.153 : 0
  const federal = monthlyIncome * (federalPct / 100)
  const state = monthlyIncome * (statePct / 100)
  const total = seTax + federal + state
  const totalPct = monthlyIncome > 0 ? (total / monthlyIncome) * 100 : 0

  const rows: ResultRow[] = [
    { item: 'Self-employment tax', amount: seTax },
    { item: 'Federal income tax (est.)', amount: federal },
    { item: 'State income tax (est.)', amount: state },
    { item: 'Total to set aside', amount: total },
  ]

  const verdict: 'good' | 'bad' | 'neutral' = totalPct > 40 ? 'bad' : totalPct < 20 ? 'neutral' : 'good'

  return {
    total,
    totalPct,
    rows,
    verdict,
  }
}

const config: ToolConfig = {
  slug: 'tax-set-aside',
  name: 'Self-Employment Tax Set-Aside Calculator',
  description: 'Estimate how much of your monthly freelance income to set aside for federal, state, and self-employment tax.',
  category: 'FinanceApplication',

  inputs: [
    { key: 'monthlyIncome', label: 'Monthly income', type: 'number', default: 6000, min: 0, unit: 'USD/month' },
    { key: 'federalPct', label: 'Federal tax rate', type: 'number', default: 12, min: 0, max: 37, unit: '%', hint: 'Your marginal federal bracket' },
    { key: 'statePct', label: 'State tax rate', type: 'number', default: 5, min: 0, max: 15, unit: '%' },
    { key: 'includeSelfEmploymentTax', label: 'Include self-employment tax (15.3%)', type: 'toggle', default: true },
  ],

  compute,

  outputs: [
    { type: 'stat', key: 'total', label: 'Set aside this month', format: 'currency', decimals: 0 },
    { type: 'stat', key: 'totalPct', label: '% of income', format: 'percent', decimals: 1 },
    {
      type: 'table',
      rowsKey: 'rows',
      columns: [
        { key: 'item', label: 'Item', format: 'text' },
        { key: 'amount', label: 'Amount', format: 'currency', decimals: 0 },
      ],
    },
    {
      type: 'verdict',
      key: 'verdict',
      variants: {
        good: { label: 'Reasonable range for most US freelancers' },
        bad: { label: 'Over 40% — double-check your brackets' },
        neutral: { label: 'Looks low — did you include self-employment tax?' },
      },
    },
    { type: 'note', text: 'Simplified estimate for US sole proprietors. Not tax advice.' },
  ],

  cta: {
    href: '/tools/hourly-rate',
    label: 'See how tax set-aside affects your rate →',
  },

  faq: [
    {
      question: 'What is self-employment tax?',
      answer:
        'It is the Social Security and Medicare tax (15.3% total). Employees split this cost with their employer; as a freelancer, you pay both halves yourself.',
    },
    {
      question: 'How often do I need to pay estimated taxes?',
      answer:
        'The IRS generally expects quarterly estimated tax payments. This tool calculates a monthly amount so you can set money aside each month and pay it out when each quarterly deadline comes around.',
    },
    {
      question: 'Does this account for tax brackets or deductions?',
      answer:
        'No — this is a simplified estimate. Federal and state rates are fields you fill in yourself based on your current marginal bracket; for an actual filing, use tax software or a CPA.',
    },
  ],
}

export default config
