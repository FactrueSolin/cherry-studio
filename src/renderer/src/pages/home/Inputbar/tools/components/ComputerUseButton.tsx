import { ActionIconButton } from '@renderer/components/Buttons'
import { Tooltip } from 'antd'
import { MonitorCog } from 'lucide-react'
import type { FC } from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  enabled: boolean
  running: boolean
  onToggle: () => void
}

const ComputerUseButton: FC<Props> = ({ enabled, running, onToggle }) => {
  const { t } = useTranslation()

  const handleClick = useCallback(() => {
    if (running) {
      return
    }
    onToggle()
  }, [onToggle, running])

  const title = enabled ? t('chat.input.computer_use.disable') : t('chat.input.computer_use.enable')

  return (
    <Tooltip placement="top" title={title} mouseLeaveDelay={0} arrow>
      <ActionIconButton onClick={handleClick} active={enabled} disabled={running} aria-label={title}>
        <MonitorCog size={18} />
      </ActionIconButton>
    </Tooltip>
  )
}

export default ComputerUseButton
