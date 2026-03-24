import type { MCPTool } from '@renderer/types'

const normalizedCoordinate = (description: string) => ({
  type: 'number',
  description
})

export const mouseTools: MCPTool[] = [
  {
    id: 'builtin-click',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'click',
    description: '在屏幕指定坐标执行鼠标左键单击',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        x: normalizedCoordinate('归一化 X 坐标，范围 [0,999]'),
        y: normalizedCoordinate('归一化 Y 坐标，范围 [0,999]')
      },
      required: ['x', 'y']
    }
  },
  {
    id: 'builtin-right-click',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'right_click',
    description: '在屏幕指定坐标执行鼠标右键点击',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        x: normalizedCoordinate('归一化 X 坐标，范围 [0,999]'),
        y: normalizedCoordinate('归一化 Y 坐标，范围 [0,999]')
      },
      required: ['x', 'y']
    }
  },
  {
    id: 'builtin-double-click',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'double_click',
    description: '在屏幕指定坐标执行鼠标双击',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        x: normalizedCoordinate('归一化 X 坐标，范围 [0,999]'),
        y: normalizedCoordinate('归一化 Y 坐标，范围 [0,999]')
      },
      required: ['x', 'y']
    }
  },
  {
    id: 'builtin-hover',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'hover',
    description: '将鼠标移动到屏幕指定坐标，不点击',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        x: normalizedCoordinate('归一化 X 坐标，范围 [0,999]'),
        y: normalizedCoordinate('归一化 Y 坐标，范围 [0,999]')
      },
      required: ['x', 'y']
    }
  }
]
