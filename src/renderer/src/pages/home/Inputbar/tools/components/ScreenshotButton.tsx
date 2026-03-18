import { ActionIconButton } from '@renderer/components/Buttons'
import type { FileMetadata } from '@renderer/types'
import { Tooltip } from 'antd'
import { Camera } from 'lucide-react'
import type { Dispatch, FC, SetStateAction } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  files: FileMetadata[]
  setFiles: Dispatch<SetStateAction<FileMetadata[]>>
  disabled?: boolean
}

const ScreenshotButton: FC<Props> = ({ files, setFiles, disabled }) => {
  const { t } = useTranslation()
  const [capturing, setCapturing] = useState(false)

  const handleCapture = async () => {
    if (capturing || disabled) {
      return
    }

    try {
      setCapturing(true)
      const screenshots = await window.api.screenshot.captureCurrentDisplay()
      setFiles((prev) => [...prev, ...screenshots])
      window.toast.success(t('chat.input.screenshot.success'))
    } catch {
      window.toast.error(t('chat.input.screenshot.failed'))
    } finally {
      setCapturing(false)
    }
  }

  const ariaLabel = t('chat.input.screenshot.capture')

  return (
    <Tooltip placement="top" title={ariaLabel} mouseLeaveDelay={0} arrow>
      <ActionIconButton
        onClick={handleCapture}
        active={files.some((file) => file.origin_name.startsWith('screenshot-'))}
        disabled={disabled || capturing}
        aria-label={ariaLabel}>
        <Camera size={18} />
      </ActionIconButton>
    </Tooltip>
  )
}

export default ScreenshotButton
