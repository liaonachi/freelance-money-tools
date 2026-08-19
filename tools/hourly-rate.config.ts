import type { Result, ToolConfig, Values } from '@/lib/tool-config'

// 公式與來源見 specs/tools.md #1

function compute(values: Values): Result {
  const targetIncome = Number(values.targetIncome)
  const billableHoursPerWeek = Number(values.billableHoursPerWeek)
  const weeksOffPerYear = Number(values.weeksOffPerYear)
  const annualExpenses = Number(values.annualExpenses)
  const taxSetAsidePct = Number(values.taxSetAsidePct)

  const billableHours = billableHoursPerWeek * (52 - weeksOffPerYear)
  const taxRate = taxSetAsidePct / 100
  const grossNeeded = taxRate < 1 ? (targetIncome + annualExpenses) / (1 - taxRate) : 0
  const hourlyRate = billableHours > 0 ? grossNeeded / billableHours : 0
  const dayRate = hourlyRate * 8

  return {
    hourlyRate,
    dayRate,
    billableHours,
    grossNeeded,
  }
}

const config: ToolConfig = {
  slug: 'hourly-rate',
  name: 'Freelance Hourly Rate Calculator',
  description: 'Work out the hourly and day rate you need to charge based on your income goal, expenses, and billable hours.',
  category: 'FinanceApplication',

  inputs: [
    { key: 'targetIncome', label: 'Target annual income', type: 'number', default: 80000, min: 0, unit: 'USD/year' },
    { key: 'billableHoursPerWeek', label: 'Billable hours per week', type: 'number', default: 25, min: 1, max: 80, unit: 'hrs/week' },
    { key: 'weeksOffPerYear', label: 'Weeks off per year', type: 'number', default: 6, min: 0, max: 30, unit: 'weeks' },
    { key: 'annualExpenses', label: 'Annual business expenses', type: 'number', default: 8000, min: 0, unit: 'USD/year' },
    { key: 'taxSetAsidePct', label: 'Tax set-aside', type: 'number', default: 25, min: 0, max: 60, step: 1, unit: '%' },
  ],

  compute,

  outputs: [
    { type: 'stat', key: 'hourlyRate', label: 'Hourly rate', format: 'currency', decimals: 0 },
    { type: 'stat', key: 'dayRate', label: 'Day rate', format: 'currency', decimals: 0 },
    { type: 'stat', key: 'billableHours', label: 'Billable hours/year', format: 'number', decimals: 0 },
    { type: 'stat', key: 'grossNeeded', label: 'Gross revenue needed', format: 'currency', decimals: 0 },
    { type: 'note', text: 'Estimates only. Adjust tax % to your situation.' },
  ],

  cta: {
    href: '/tools/tax-set-aside',
    label: 'Not sure what % to set aside for tax? →',
  },

  faq: [
    {
      question: 'Why is my freelance rate so much higher than my old salary ÷ hours?',
      answer:
        'Your rate has to cover non-billable time (finding clients, admin, learning), plus taxes and benefits an employer used to pay for, and unpaid time off — none of that shows up in a salary-to-hourly conversion.',
    },
    {
      question: 'How many billable hours per week is realistic?',
      answer:
        'Most full-time freelancers land between 20–30 billable hours a week. If you are new or your pipeline is inconsistent, use a more conservative number (20 or below).',
    },
    {
      question: 'Should I include retirement savings in annual expenses?',
      answer:
        'Yes — freelancers do not get an employer 401(k) match, so add your retirement savings goal (for example, a SEP-IRA contribution target) into the Annual business expenses field.',
    },
  ],
}

export default config
