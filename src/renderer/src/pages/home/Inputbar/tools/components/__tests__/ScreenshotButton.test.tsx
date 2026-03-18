import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ScreenshotButton from '../ScreenshotButton'

vi.mock('@renderer/components/Buttons', () => ({
  ActionIconButton: vi.fn(({ children, onClick, disabled, ...props }) => (
    <button type="button" onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ))
}))

vi.mock('antd', () => ({
  Tooltip: vi.fn(({ children, title }) => (
    <div data-testid="tooltip" data-title={title}>
      {children}
    </div>
  ))
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        ({
          'chat.input.screenshot.capture': 'Capture screenshot',
          'chat.input.screenshot.success': 'Screenshot attached',
          'chat.input.screenshot.failed': 'Failed to capture screenshot'
        }) as Record<string, string>
      )[key] ?? key
  })
}))

describe('ScreenshotButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    window.api = {
      screenshot: {
        captureCurrentDisplay: vi.fn()
      }
    } as any

    window.toast = {
      success: vi.fn(),
      error: vi.fn()
    } as any
  })

  it('captures a screenshot and appends it to files', async () => {
    const setFiles = vi.fn()
    ;(window.api.screenshot.captureCurrentDisplay as any).mockResolvedValue([
      { id: 'shot-1', origin_name: 'screenshot-1.png' },
      { id: 'shot-2', origin_name: 'screenshot-2.png' }
    ])

    render(<ScreenshotButton files={[]} setFiles={setFiles} />)

    fireEvent.click(screen.getByRole('button', { name: 'Capture screenshot' }))

    await waitFor(() => {
      expect(window.api.screenshot.captureCurrentDisplay).toHaveBeenCalledTimes(1)
      expect(setFiles).toHaveBeenCalledTimes(1)
      expect(window.toast.success).toHaveBeenCalledWith('Screenshot attached')
    })
  })

  it('shows an error toast when capture fails', async () => {
    const setFiles = vi.fn()
    ;(window.api.screenshot.captureCurrentDisplay as any).mockRejectedValue(new Error('capture failed'))

    render(<ScreenshotButton files={[]} setFiles={setFiles} />)

    fireEvent.click(screen.getByRole('button', { name: 'Capture screenshot' }))

    await waitFor(() => {
      expect(window.toast.error).toHaveBeenCalledWith('Failed to capture screenshot')
    })
    expect(setFiles).not.toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    const setFiles = vi.fn()

    render(<ScreenshotButton files={[]} setFiles={setFiles} disabled />)

    expect(screen.getByRole('button', { name: 'Capture screenshot' })).toBeDisabled()
  })
})
