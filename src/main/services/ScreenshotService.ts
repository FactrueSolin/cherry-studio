import { loggerService } from '@logger'
import { stitchImages } from '@main/helpers/rustSdk'
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

    logger.info('Screen sources fetched for screenshot capture', {
      sourceCount: sources.length,
      sourceDisplayIds: sources.map((source) => source.display_id),
      displayIds: displays.map((display) => String(display.id))
    })

    if (!sources.length) {
      logger.error(
        'No screen source available for screenshot capture',
        new Error('No screen source available for screenshot capture'),
        {
          displayCount: displays.length,
          thumbnailSize
        }
      )
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

    logger.info('Matched screen sources for screenshot capture', {
      matchedCount: matchedSources.length,
      matchedDisplayIds: matchedSources.map(({ display }) => String(display.id)),
      unmatchedDisplayIds: displays
        .filter((display) => !matchedSources.some((item) => item.display.id === display.id))
        .map((display) => String(display.id))
    })

    if (!matchedSources.length) {
      logger.error(
        'No matched display source available for screenshot capture',
        new Error('No matched display source available for screenshot capture'),
        {
          sourceDisplayIds: sources.map((source) => source.display_id),
          displayIds: displays.map((display) => String(display.id))
        }
      )
      throw new Error('No matched display source available for screenshot capture')
    }

    const stitchedWidth = matchedSources.reduce((sum, { display }) => sum + display.size.width, 0)
    const stitchedHeight = matchedSources.reduce((max, { display }) => Math.max(max, display.size.height), 1)

    let currentOffsetX = 0
    const stitchRequest = {
      stitchedWidth,
      stitchedHeight,
      images: matchedSources.map(({ source, index, display }) => {
        const screenSource = source!
        const pngBuffer = screenSource.thumbnail.toPNG()

        logger.info('Prepared per-display screenshot buffer for stitching', {
          displayId: String(display.id || index),
          pngBytes: pngBuffer.length,
          width: display.size.width,
          height: display.size.height,
          scaleFactor: display.scaleFactor,
          sourceDisplayId: screenSource.display_id
        })

        if (!pngBuffer.length) {
          logger.error('Captured screenshot is empty for display', new Error('Captured screenshot is empty'), {
            displayId: String(display.id || index),
            sourceDisplayId: screenSource.display_id
          })
          throw new Error(`Captured screenshot is empty for display ${display.id || index}`)
        }

        const item = {
          imageBase64: pngBuffer.toString('base64'),
          width: display.size.width,
          height: display.size.height,
          offsetX: currentOffsetX,
          offsetY: 0
        }

        currentOffsetX += display.size.width
        return item
      })
    }

    logger.info('Calling rust-sdk stitchImages for screenshot capture', {
      stitchedWidth,
      stitchedHeight,
      imageCount: stitchRequest.images.length
    })

    const stitched = await stitchImages(stitchRequest)

    logger.info('rust-sdk stitchImages completed for screenshot capture', {
      stitchedWidth: stitched.stitchedWidth,
      stitchedHeight: stitched.stitchedHeight,
      outputBase64Length: stitched.imageBase64.length
    })

    const stitchedBuffer = Buffer.from(stitched.imageBase64, 'base64')

    logger.info('Decoded stitched screenshot buffer', {
      stitchedBytes: stitchedBuffer.length
    })

    const file = await fileStorage.savePastedImage({} as Electron.IpcMainInvokeEvent, stitchedBuffer, '.png')

    const files = [
      {
        ...file,
        origin_name: `screenshot-${timestamp}.png`
      }
    ]

    logger.info('Captured screenshots for all displays', {
      count: matchedSources.length,
      stitchedWidth,
      stitchedHeight,
      outputCount: files.length
    })

    return files
  }
}

export const screenshotService = new ScreenshotService()
