import { loggerService } from '@logger'

import { applicationHelper } from './application'
import { keyboardHelper } from './keyboard'
import { mouseHelper } from './mouse'

const logger = loggerService.withContext('UiControlHelper')

export const uiControlHelper = {
  mouse: mouseHelper,
  keyboard: keyboardHelper,
  application: applicationHelper
}

logger.info('UI control helper initialized')

export type UiControlHelper = typeof uiControlHelper
