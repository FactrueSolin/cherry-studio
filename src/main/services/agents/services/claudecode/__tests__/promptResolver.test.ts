import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveAgentPromptVariables } from '../promptResolver'

vi.mock('@main/services/ReduxService', () => ({
  reduxService: {
    getState: vi.fn()
  }
}))

vi.mock('@main/utils/process', () => ({
  executeShellCommand: vi.fn()
}))

vi.mock('@main/utils/system', () => ({
  getDeviceType: vi.fn(() => 'mac')
}))

import { reduxService } from '@main/services/ReduxService'
import { executeShellCommand } from '@main/utils/process'

describe('resolveAgentPromptVariables', () => {
  const session = {
    model: 'anthropic:claude-sonnet-4-5',
    instructions: '',
    configuration: {},
    accessible_paths: []
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(reduxService.getState).mockResolvedValue({
      settings: {
        language: 'zh-CN',
        userName: 'futiansi'
      }
    })
    vi.mocked(executeShellCommand).mockResolvedValue('command-output')
  })

  it('resolves built-in variables for agent instructions', async () => {
    const result = await resolveAgentPromptVariables(
      'Lang={{language}}, User={{username}}, System={{system}}, Arch={{arch}}, Model={{model_name}}',
      session
    )

    expect(result).toContain('Lang=zh-CN')
    expect(result).toContain('User=futiansi')
    expect(result).toContain('System=mac')
    expect(result).toContain('Model=anthropic:claude-sonnet-4-5')
  })

  it('resolves command injections for agent instructions', async () => {
    const result = await resolveAgentPromptVariables('Branch={{cmd:[git branch --show-current]}}', session)

    expect(executeShellCommand).toHaveBeenCalledWith('git branch --show-current', {
      timeout: 10000,
      maxOutputLength: 4000
    })
    expect(result).toBe('Branch=command-output')
  })

  it('replaces failed command injections with empty string', async () => {
    vi.mocked(executeShellCommand).mockRejectedValueOnce(new Error('failed'))

    const result = await resolveAgentPromptVariables('Branch={{cmd:[git branch --show-current]}}', session)

    expect(result).toBe('Branch=')
  })
})
