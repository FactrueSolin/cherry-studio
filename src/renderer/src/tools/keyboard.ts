import type { MCPTool } from '@renderer/types'

export const keyboardTools: MCPTool[] = [
  {
    id: 'builtin-type-text',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'type_text',
    description: '模拟键盘输入指定文本',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '要输入的文本' }
      },
      required: ['text']
    }
  },
  {
    id: 'builtin-press-key',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'press_key',
    description: '模拟按下并释放单个按键',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: '按键名称' }
      },
      required: ['key']
    }
  },
  {
    id: 'builtin-hotkey',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'hotkey',
    description: '模拟组合键操作',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        modifiers: {
          type: 'array',
          items: { type: 'string' },
          description: '修饰键列表'
        },
        key: { type: 'string', description: '主按键' }
      },
      required: ['modifiers', 'key']
    }
  }
]
