import type { MCPTool } from '@renderer/types'

export const applicationTools: MCPTool[] = [
  {
    id: 'builtin-open-application',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'open_application',
    description: '打开指定的应用程序',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        app_name: { type: 'string', description: '应用程序名称' }
      },
      required: ['app_name']
    }
  },
  {
    id: 'builtin-close-application',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'close_application',
    description: '关闭指定的应用程序',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        app_name: { type: 'string', description: '应用程序名称' }
      },
      required: ['app_name']
    }
  },
  {
    id: 'builtin-focus-application',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'focus_application',
    description: '将指定应用程序切换到前台并聚焦',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {
        app_name: { type: 'string', description: '应用程序名称' }
      },
      required: ['app_name']
    }
  },
  {
    id: 'builtin-list-running-applications',
    serverId: 'builtin-ui-control',
    serverName: 'Built-in UI Control',
    name: 'list_running_applications',
    description: '列出当前正在运行的应用程序',
    isBuiltIn: true,
    type: 'mcp',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
]
