import { describe, expect, it } from 'vitest'

import { buildComputerUseInstruction, buildComputerUseUserContent } from '../ComputerUseMessageBuilder'
import { buildComputerUseSystemPrompt } from '../ComputerUsePromptBuilder'

describe('ComputerUseMessageBuilder', () => {
  it('builds first-round instruction', () => {
    expect(
      buildComputerUseInstruction({
        taskGoal: '打开设置',
        round: 1
      })
    ).toContain('请分析当前屏幕截图，并执行下一步操作。')
  })

  it('appends app shortcuts context when present', () => {
    const instruction = buildComputerUseInstruction({
      taskGoal: '打开设置',
      round: 2,
      appShortcutsContext: '当前应用快捷键：Ctrl+L'
    })

    expect(instruction).toContain('继续执行下一步操作。')
    expect(instruction).toContain('当前应用快捷键：Ctrl+L')
  })

  it('builds user content with screenshot', () => {
    const content = buildComputerUseUserContent({
      taskGoal: '打开设置',
      screenshotDataUrl: 'data:image/png;base64,abc',
      round: 1
    })

    expect(content).toEqual([
      {
        type: 'text',
        text: '任务目标：打开设置\n\n请分析当前屏幕截图，并执行下一步操作。'
      },
      {
        type: 'image_url',
        image_url: { url: 'data:image/png;base64,abc' }
      }
    ])
  })

  it('falls back to unchanged hint when screenshot is absent', () => {
    const content = buildComputerUseUserContent({
      taskGoal: '打开设置',
      screenUnchangedHint: '[截图未变化]',
      round: 2
    })

    expect(content[1]).toEqual({
      type: 'text',
      text: '[截图未变化]'
    })
  })
})

describe('ComputerUsePromptBuilder', () => {
  it('builds system prompt with tools and running applications', () => {
    const prompt = buildComputerUseSystemPrompt({
      assistantPrompt: '你是一个助手',
      availableTools: [
        { name: 'click', description: '执行点击' },
        { name: 'type_text', description: '输入文本' }
      ],
      runningApplications: ['Chrome', 'Terminal']
    })

    expect(prompt).toContain('你是一个助手')
    expect(prompt).toContain('你现在处于 computer use 模式。')
    expect(prompt).toContain('当前正在运行的应用：Chrome、Terminal')
    expect(prompt).toContain('- click: 执行点击')
    expect(prompt).toContain('- type_text: 输入文本')
  })
})
