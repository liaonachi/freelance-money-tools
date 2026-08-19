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
  it('render cash-vs-points 預設值時顯示 verdict 與 CTA', async () => {
    render(<ToolRenderer slug="cash-vs-points" />)

    // 預設值 (15000-3500)/20000=0.575 對市場估值 0.85，差距超過 10% → bad
    expect(await screen.findByText(/不划算，低於市場估值/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /不划算？先看看其他方案/ })).toHaveClass('bg-primary')
  })

  it('改動輸入後 verdict／CTA 文字與樣式跟著變', async () => {
    const user = userEvent.setup()
    render(<ToolRenderer slug="cash-vs-points" />)

    const marketValueInput = screen.getByLabelText(/每點市場估值/)
    await user.clear(marketValueInput)
    await user.type(marketValueInput, '0.5')

    // actualCostPerPoint 0.575 對市場估值 0.5，差距約 15% 且高於估值 → good
    expect(await screen.findByText(/划算！高於市場估值/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /想知道你的點數值多少/ })).not.toHaveClass('bg-primary')
  })

  it('打非數字字元不會 crash，欄位維持可編輯', async () => {
    const user = userEvent.setup()
    render(<ToolRenderer slug="cash-vs-points" />)

    const cashPriceInput = screen.getByLabelText(/現金價格/) as HTMLInputElement
    await user.clear(cashPriceInput)
    await user.type(cashPriceInput, 'abc')

    expect(cashPriceInput.value).toBe('')
    // compute 仍拿得到上一個合法值，結果區塊不會消失/報錯
    expect(screen.getByText(/每點實際花費/)).toBeInTheDocument()
  })

  it('所需點數清成 0 時結果區塊整個消失（showOutputsWhen）', async () => {
    const user = userEvent.setup()
    render(<ToolRenderer slug="cash-vs-points" />)

    const pointsInput = screen.getByLabelText(/兌換所需點數/)
    await user.clear(pointsInput)
    await user.type(pointsInput, '0')

    expect(screen.queryByText(/每點實際花費/)).not.toBeInTheDocument()
  })

  it('table 型輸出（points-value）正確渲染欄位', async () => {
    render(<ToolRenderer slug="points-value" />)
    expect(await screen.findByText('Program A')).toBeInTheDocument()
    expect(screen.getByText('Program B')).toBeInTheDocument()
    expect(screen.getByText('Program C')).toBeInTheDocument()
  })

  it('找不到的 slug render fallback 文字，不 crash', () => {
    render(<ToolRenderer slug="does-not-exist" />)
    expect(screen.getByText(t('tools.notFound'))).toBeInTheDocument()
  })
})
