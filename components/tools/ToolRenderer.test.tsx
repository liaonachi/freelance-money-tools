// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import { ToolRenderer } from './ToolRenderer'
import { t } from '@/messages'

afterEach(() => {
  cleanup()
})

describe('ToolRenderer', () => {
  it('render tax-set-aside 預設值時顯示 verdict 與 table', async () => {
    render(<ToolRenderer slug="tax-set-aside" />)

    // 預設值 totalPct ≈ 31.1%，介於 20–40 之間 → good
    expect(await screen.findByText(/Reasonable range for most US freelancers/)).toBeInTheDocument()
    expect(screen.getByText('Self-employment tax')).toBeInTheDocument()
    expect(screen.getByText('Total to set aside')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /See how tax set-aside affects your rate/ })).toBeInTheDocument()
  })

  it('toggle 關掉 self-employment tax 後 verdict 變成 neutral', async () => {
    const user = userEvent.setup()
    render(<ToolRenderer slug="tax-set-aside" />)

    const seToggle = screen.getByLabelText(/Include self-employment tax/)
    await user.click(seToggle)

    // 關掉後 totalPct = (720+300)/6000 = 17% < 20 → neutral
    expect(await screen.findByText(/Looks low — did you include self-employment tax/)).toBeInTheDocument()
  })

  it('select 切換 rate type 後 effective annual rate 跟著變', async () => {
    const user = userEvent.setup()
    render(<ToolRenderer slug="late-fee" />)

    // 預設 monthly 1.5% → effective annual rate 18.3%
    expect(await screen.findByText('18.3%')).toBeInTheDocument()

    const rateTypeSelect = screen.getByLabelText(/Rate type/)
    await user.selectOptions(rateTypeSelect, 'annual')

    // 切成 annual 後 1.5% 本身就是年化利率
    expect(await screen.findByText('1.5%')).toBeInTheDocument()
  })

  it('打非數字字元不會 crash，欄位維持可編輯', async () => {
    const user = userEvent.setup()
    render(<ToolRenderer slug="hourly-rate" />)

    const targetIncomeInput = screen.getByLabelText(/Target annual income/) as HTMLInputElement
    await user.clear(targetIncomeInput)
    await user.type(targetIncomeInput, 'abc')

    expect(targetIncomeInput.value).toBe('')
    // compute 仍拿得到上一個合法值，結果區塊不會消失/報錯
    expect(screen.getByText('Hourly rate')).toBeInTheDocument()
  })

  it('找不到的 slug render fallback 文字，不 crash', () => {
    render(<ToolRenderer slug="does-not-exist" />)
    expect(screen.getByText(t('tools.notFound'))).toBeInTheDocument()
  })
})
