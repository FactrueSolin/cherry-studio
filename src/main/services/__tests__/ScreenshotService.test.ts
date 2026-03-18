import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockToPNG = vi.fn()
const mockGetSources = vi.fn()
const mockGetAllDisplays = vi.fn()
const mockSavePastedImage = vi.fn()

vi.mock('electron', () => ({
  desktopCapturer: {
    getSources: mockGetSources
  },
  screen: {
    getAllDisplays: mockGetAllDisplays
  }
}))

vi.mock('@main/services/FileStorage', () => ({
  fileStorage: {
    savePastedImage: mockSavePastedImage
  }
}))

describe('ScreenshotService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetAllDisplays.mockReturnValue([
      {
        id: 1,
        scaleFactor: 2,
        size: { width: 100, height: 60 }
      },
      {
        id: 2,
        scaleFactor: 1,
        size: { width: 80, height: 50 }
      }
    ])

    mockToPNG.mockReturnValue(Buffer.from('png-binary'))
    mockGetSources.mockResolvedValue([
      {
        display_id: '1',
        thumbnail: { toPNG: mockToPNG }
      },
      {
        display_id: '2',
        thumbnail: { toPNG: mockToPNG }
      }
    ])

    mockSavePastedImage.mockResolvedValue({
      id: 'file-1',
      origin_name: 'pasted_image_file-1.png',
      name: 'file-1.png',
      path: '/tmp/file-1.png',
      created_at: '2026-01-01T00:00:00.000Z',
      size: 10,
      ext: 'png',
      type: 'image',
      count: 1
    })
  })

  it('captures all displays and saves them as PNG attachments', async () => {
    const { screenshotService } = await import('../ScreenshotService')

    const result = await screenshotService.captureCurrentDisplay()

    expect(mockGetSources).toHaveBeenCalledWith({
      types: ['screen'],
      thumbnailSize: { width: 200, height: 120 },
      fetchWindowIcons: false
    })
    expect(mockSavePastedImage).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
    expect(result[0].origin_name).toMatch(/^screenshot-.*-1\.png$/)
    expect(result[1].origin_name).toMatch(/^screenshot-.*-2\.png$/)
  })

  it('throws when no screen source is available', async () => {
    mockGetSources.mockResolvedValue([])
    const { screenshotService } = await import('../ScreenshotService')

    await expect(screenshotService.captureCurrentDisplay()).rejects.toThrow(
      'No screen source available for screenshot capture'
    )
  })

  it('throws when no matched screen source is available', async () => {
    mockGetSources.mockResolvedValue([
      {
        display_id: '999',
        thumbnail: { toPNG: mockToPNG }
      }
    ])
    const { screenshotService } = await import('../ScreenshotService')

    await expect(screenshotService.captureCurrentDisplay()).rejects.toThrow(
      'No matched display source available for screenshot capture'
    )
  })

  it('throws when the captured PNG is empty', async () => {
    mockToPNG.mockReturnValue(Buffer.alloc(0))
    const { screenshotService } = await import('../ScreenshotService')

    await expect(screenshotService.captureCurrentDisplay()).rejects.toThrow(
      'Captured screenshot is empty for display 1'
    )
  })
})
