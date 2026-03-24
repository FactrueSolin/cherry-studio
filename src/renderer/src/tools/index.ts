import type { MCPTool } from '@renderer/types'

import { applicationTools } from './application'
import { keyboardTools } from './keyboard'
import { mouseTools } from './mouse'
import { thinkTool } from './think'

export const BUILT_IN_TOOLS: MCPTool[] = [thinkTool, ...mouseTools, ...keyboardTools, ...applicationTools]

export function getBuiltInTool(name: string): MCPTool | undefined {
  return BUILT_IN_TOOLS.find((tool) => tool.name === name || tool.id === name)
}

export function isBuiltInTool(tool: MCPTool): boolean {
  return tool.isBuiltIn === true
}

export * from './application'
export * from './keyboard'
export * from './mouse'
export * from './think'
