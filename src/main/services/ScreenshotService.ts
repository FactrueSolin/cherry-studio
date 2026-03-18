import { loggerService } from '@logger'
import { fileStorage } from '@main/services/FileStorage'
import type { FileMetadata } from '@types'
import { desktopCapturer, screen } from 'electron'

const logger = loggerService.withContext('ScreenshotService')

class ScreenshotService {
  public async captureCurrentDisplay(): Promise<FileMetadata[]> {
    const displays = screen.getAllDisplays()
    const thumbnailSize = displays.reduce(
      (acc, display) => ({
        width: Math.max(acc.width, Math.max(1, Math.round(display.size.width * display.scaleFactor))),
        height: Math.max(acc.height, Math.max(1, Math.round(display.size.height * display.scaleFactor)))
      }),
      { width: 1, height: 1 }
    )

    logger.info('Capturing screenshots for all displays', {
      displayCount: displays.length,
      thumbnailWidth: thumbnailSize.width,
      thumbnailHeight: thumbnailSize.height
    })

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize,
      fetchWindowIcons: false
    })

    if (!sources.length) {
      throw new Error('No screen source available for screenshot capture')
    }

    const timestamp = new Date().toISOString().replace(/[.:]/g, '-').replace('T', '_').replace('Z', '')

    const matchedSources = displays
      .map((display, index) => ({
        display,
        index,
        source: sources.find((source) => source.display_id === String(display.id))
      }))
      .filter((item) => item.source)

    if (!matchedSources.length) {
      throw new Error('No matched display source available for screenshot capture')
    }

    const files = await Promise.all(
      matchedSources.map(async ({ source, index, display }) => {
        const screenSource = source!
        const pngBuffer = screenSource.thumbnail.toPNG()

        if (!pngBuffer.length) {
          throw new Error(`Captured screenshot is empty for display ${display.id || index}`)
        }

        const file = await fileStorage.savePastedImage({} as Electron.IpcMainInvokeEvent, pngBuffer, '.png')

        return {
          ...file,
          origin_name: `screenshot-${timestamp}-${index + 1}.png`
        }
      })
    )

    logger.info('Captured screenshots for all displays', {
      count: files.length
    })

    return files
  }
}

export const screenshotService = new ScreenshotService()
