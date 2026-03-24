import { isLinux, isMac, isWin } from '@main/constant'

import { requireCommand, runCommand } from './process'

async function unsupported(feature: string): Promise<never> {
  throw new Error(`${feature} is not implemented for the current platform`)
}

export const applicationHelper = {
  async open({ appName }: { appName: string }): Promise<string> {
    if (isLinux) {
      await runCommand('bash', ['-lc', `gtk-launch "${appName}" || xdg-open "${appName}"`])
    } else if (isMac) {
      await runCommand('open', ['-a', appName])
    } else if (isWin) {
      await runCommand('powershell', ['-Command', `Start-Process -FilePath '${appName.replace(/'/g, "''")}'`])
    }

    return `已打开应用: ${appName}`
  },

  async close({ appName }: { appName: string }): Promise<string> {
    if (isLinux) {
      await runCommand('pkill', ['-f', appName])
    } else if (isMac) {
      await runCommand('osascript', ['-e', `tell application "${appName}" to quit`])
    } else if (isWin) {
      await runCommand('taskkill', ['/IM', appName, '/F'])
    }

    return `已关闭应用: ${appName}`
  },

  async focus({ appName }: { appName: string }): Promise<string> {
    if (isLinux) {
      await requireCommand('wmctrl', 'Application focus')
      await runCommand('wmctrl', ['-a', appName])
    } else if (isMac) {
      await runCommand('osascript', ['-e', `tell application "${appName}" to activate`])
    } else if (isWin) {
      await unsupported('Application focus')
    }

    return `已聚焦应用: ${appName}`
  },

  async listRunning(): Promise<string[]> {
    if (isLinux) {
      await requireCommand('wmctrl', 'List running applications')
      const output = await runCommand('wmctrl', ['-lx'])
      return output
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.split(/\s+/)[2] || line)
    }

    if (isMac) {
      const output = await runCommand('osascript', [
        '-e',
        'tell application "System Events" to get name of (processes where background only is false)'
      ])
      return output
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }

    if (isWin) {
      const output = await runCommand('powershell', [
        '-Command',
        'Get-Process | Where-Object {$_.MainWindowTitle} | Select-Object -ExpandProperty ProcessName'
      ])
      return output
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    }

    return []
  }
}
