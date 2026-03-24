import type { ComputerUsePromptContext } from './types'

function formatTools(tools: ComputerUsePromptContext['availableTools']): string {
  if (!tools.length) {
    return '- 无可用工具'
  }

  return tools.map((tool) => `- ${tool.name}${tool.description ? `: ${tool.description}` : ''}`).join('\n')
}

function formatRunningApplications(apps: string[] | undefined): string {
  if (!apps?.length) {
    return '当前未检测到运行中应用。'
  }

  return `当前正在运行的应用：${apps.join('、')}`
}

export function buildComputerUseSystemPrompt({
  assistantPrompt,
  availableTools,
  runningApplications
}: ComputerUsePromptContext): string {
  const sections = [
    assistantPrompt?.trim(),
    [
      '你现在处于 computer use 模式。',
      '你可以观察当前屏幕截图，并调用电脑控制工具逐步完成任务。',
      '每次只做最必要的一步操作。',
      '如果截图没有变化，不要重复执行同样的动作。',
      '当需要操作电脑时，优先调用工具，而不是仅描述下一步。',
      formatRunningApplications(runningApplications),
      '可用的 computer use 工具如下：',
      formatTools(availableTools)
    ].join('\n')
  ].filter((section): section is string => Boolean(section && section.trim()))

  return sections.join('\n\n')
}
