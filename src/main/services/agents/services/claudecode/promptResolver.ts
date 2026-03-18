import { arch } from 'node:os'

import { loggerService } from '@logger'
import { reduxService } from '@main/services/ReduxService'
import { executeShellCommand } from '@main/utils/process'
import { getDeviceType } from '@main/utils/system'
import type { GetAgentSessionResponse } from '@types'

const logger = loggerService.withContext('ClaudeCodePromptResolver')

const COMMAND_INJECTION_REGEX = /{{cmd:\[([^\]\r\n]+)\]}}/g
const COMMAND_TIMEOUT_MS = 10_000
const MAX_COMMAND_LENGTH = 1000

function isSafePromptCommand(command: string): boolean {
  const trimmed = command.trim()
  if (!trimmed || trimmed.length > MAX_COMMAND_LENGTH) {
    return false
  }

  if (trimmed.includes('\n') || trimmed.includes('\r') || trimmed.includes(']')) {
    return false
  }

  return true
}

function replaceBuiltinPromptVariables(
  prompt: string,
  options: {
    modelName?: string
    language?: string
    userName?: string
  }
) {
  let result = prompt
  const now = new Date()

  if (result.includes('{{date}}')) {
    result = result.replace(
      /{{date}}/g,
      now.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      })
    )
  }

  if (result.includes('{{time}}')) {
    result = result.replace(/{{time}}/g, now.toLocaleTimeString())
  }

  if (result.includes('{{datetime}}')) {
    result = result.replace(
      /{{datetime}}/g,
      now.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    )
  }

  if (result.includes('{{username}}')) {
    result = result.replace(/{{username}}/g, options.userName || 'Unknown Username')
  }

  if (result.includes('{{system}}')) {
    result = result.replace(/{{system}}/g, getDeviceType())
  }

  if (result.includes('{{language}}')) {
    result = result.replace(/{{language}}/g, options.language || 'Unknown System Language')
  }

  if (result.includes('{{arch}}')) {
    result = result.replace(/{{arch}}/g, arch())
  }

  if (result.includes('{{model_name}}')) {
    result = result.replace(/{{model_name}}/g, options.modelName || 'Unknown Model')
  }

  return result
}

async function replaceCommandPromptInjections(prompt: string): Promise<string> {
  if (!prompt.includes('{{cmd:[')) {
    return prompt
  }

  COMMAND_INJECTION_REGEX.lastIndex = 0
  const matches = [...prompt.matchAll(COMMAND_INJECTION_REGEX)]
  if (matches.length === 0) {
    return prompt
  }

  const uniqueCommands = [...new Set(matches.map((match) => match[1].trim()))]
  const commandResults = new Map<string, string>()

  for (const command of uniqueCommands) {
    if (!isSafePromptCommand(command)) {
      logger.warn('Unsafe agent prompt command rejected', { command })
      commandResults.set(command, '')
      continue
    }

    try {
      const output = await executeShellCommand(command, {
        timeout: COMMAND_TIMEOUT_MS,
        maxOutputLength: 4000
      })
      commandResults.set(command, output.slice(0, 4000))
    } catch (error) {
      logger.error('Failed to execute agent prompt command', error as Error)
      commandResults.set(command, '')
    }
  }

  return prompt.replace(COMMAND_INJECTION_REGEX, (_match, command: string) => {
    return commandResults.get(command.trim()) ?? ''
  })
}

export async function resolveAgentPromptVariables(
  instructions: string | null | undefined,
  session: GetAgentSessionResponse
): Promise<string> {
  if (!instructions) {
    return ''
  }

  let language: string | undefined
  let userName: string | undefined

  try {
    const state = await reduxService.getState()
    language = state?.settings?.language
    userName = state?.settings?.userName
  } catch (error) {
    logger.warn('Failed to get renderer state for agent prompt resolution', {
      error: error instanceof Error ? error.message : String(error)
    })
  }

  const builtInResolved = replaceBuiltinPromptVariables(instructions, {
    modelName: session.model || undefined,
    language,
    userName
  })

  return await replaceCommandPromptInjections(builtInResolved)
}
