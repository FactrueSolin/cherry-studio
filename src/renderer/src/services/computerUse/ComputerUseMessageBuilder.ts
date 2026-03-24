import type { ComputerUseUserContentPart, ComputerUseUserMessageInput } from './types'

export function buildComputerUseInstruction({
  taskGoal,
  appShortcutsContext,
  round
}: Pick<ComputerUseUserMessageInput, 'taskGoal' | 'appShortcutsContext' | 'round'>): string {
  const instruction =
    round <= 1
      ? `任务目标：${taskGoal}\n\n请分析当前屏幕截图，并执行下一步操作。`
      : `任务目标：${taskGoal}\n\n请分析当前屏幕截图，继续执行下一步操作。`

  if (!appShortcutsContext?.trim()) {
    return instruction
  }

  return `${instruction}\n\n${appShortcutsContext.trim()}`
}

export function buildComputerUseUserContent({
  taskGoal,
  screenshotDataUrl,
  screenUnchangedHint,
  appShortcutsContext,
  round
}: ComputerUseUserMessageInput): ComputerUseUserContentPart[] {
  const content: ComputerUseUserContentPart[] = [
    {
      type: 'text',
      text: buildComputerUseInstruction({ taskGoal, appShortcutsContext, round })
    }
  ]

  if (screenshotDataUrl) {
    content.push({
      type: 'image_url',
      image_url: { url: screenshotDataUrl }
    })
  } else if (screenUnchangedHint?.trim()) {
    content.push({
      type: 'text',
      text: screenUnchangedHint.trim()
    })
  }

  return content
}
