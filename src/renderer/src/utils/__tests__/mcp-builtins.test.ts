import type { MCPToolResponse } from '@renderer/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@renderer/store', () => ({
  default: {
    getState: vi.fn(() => ({
      mcp: { servers: [] }
    })),
    dispatch: vi.fn()
  }
}))

vi.mock('@renderer/store/mcp', () => ({
  addMCPServer: vi.fn(),
  hubMCPServer: { id: 'hub', name: '@cherry/hub' }
}))

vi.mock('@renderer/services/SpanManagerService', () => ({
  currentSpan: vi.fn()
}))

vi.mock('@renderer/config/models', () => ({
  isFunctionCallingModel: vi.fn(() => true),
  isVisionModel: vi.fn(() => false)
}))

import { callBuiltInTool } from '../mcp-tools'

const click = vi.fn()
const rightClick = vi.fn()
const doubleClick = vi.fn()
const hover = vi.fn()
const typeText = vi.fn()
const pressKey = vi.fn()
const hotkey = vi.fn()
const open = vi.fn()
const close = vi.fn()
const focus = vi.fn()
const listRunning = vi.fn()

describe('callBuiltInTool', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    window.api = {
      ...window.api,
      uiControl: {
        mouse: { click, rightClick, doubleClick, hover },
        keyboard: { typeText, pressKey, hotkey },
        application: { open, close, focus, listRunning }
      }
    } as typeof window.api
  })

  it('dispatches click built-in tool to uiControl mouse api', async () => {
    click.mockResolvedValue('clicked')

    const result = await callBuiltInTool({
      id: '1',
      tool: {
        id: 'builtin-click',
        serverId: 'builtin-ui-control',
        serverName: 'Built-in UI Control',
        name: 'click',
        type: 'mcp',
        isBuiltIn: true,
        inputSchema: { type: 'object', properties: {}, required: [] }
      },
      arguments: { x: 100, y: 200 },
      status: 'pending'
    } as MCPToolResponse)

    expect(click).toHaveBeenCalledWith(100, 200)
    expect(result).toEqual({ isError: false, content: [{ type: 'text', text: 'clicked' }] })
  })

  it('dispatches keyboard hotkey built-in tool to uiControl keyboard api', async () => {
    hotkey.mockResolvedValue('hotkey executed')

    const result = await callBuiltInTool({
      id: '2',
      tool: {
        id: 'builtin-hotkey',
        serverId: 'builtin-ui-control',
        serverName: 'Built-in UI Control',
        name: 'hotkey',
        type: 'mcp',
        isBuiltIn: true,
        inputSchema: { type: 'object', properties: {}, required: [] }
      },
      arguments: { modifiers: ['ctrl', 'shift'], key: 'p' },
      status: 'pending'
    } as MCPToolResponse)

    expect(hotkey).toHaveBeenCalledWith(['ctrl', 'shift'], 'p')
    expect(result).toEqual({ isError: false, content: [{ type: 'text', text: 'hotkey executed' }] })
  })

  it('dispatches list_running_applications built-in tool to uiControl application api', async () => {
    listRunning.mockResolvedValue(['code', 'cherry-studio'])

    const result = await callBuiltInTool({
      id: '3',
      tool: {
        id: 'builtin-list-running-applications',
        serverId: 'builtin-ui-control',
        serverName: 'Built-in UI Control',
        name: 'list_running_applications',
        type: 'mcp',
        isBuiltIn: true,
        inputSchema: { type: 'object', properties: {}, required: [] }
      },
      arguments: {},
      status: 'pending'
    } as MCPToolResponse)

    expect(listRunning).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      isError: false,
      content: [{ type: 'text', text: JSON.stringify(['code', 'cherry-studio']) }]
    })
  })
})
