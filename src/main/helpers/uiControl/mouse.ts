import { isLinux, isMac, isWin } from '@main/constant'

import { type NormalizedPointInput, normalizedToGlobal } from './layout'
import { requireCommand, runCommand } from './process'

async function runLinuxMouse(args: string[]): Promise<void> {
  await requireCommand('xdotool', 'Mouse control')
  await runCommand('xdotool', args)
}

async function runMacMouse(script: string): Promise<void> {
  await runCommand('osascript', ['-e', script])
}

async function unsupported(feature: string): Promise<never> {
  throw new Error(`${feature} is not implemented for the current platform`)
}

async function moveTo({ x, y }: NormalizedPointInput): Promise<{ x: number; y: number }> {
  const point = normalizedToGlobal({ x, y })

  if (isLinux) {
    await runLinuxMouse(['mousemove', String(point.x), String(point.y)])
    return point
  }

  if (isMac) {
    await runMacMouse(`tell application "System Events" to set the position of the mouse to {${point.x}, ${point.y}}`)
    return point
  }

  if (isWin) {
    await unsupported('Mouse move')
  }

  return point
}

export const mouseHelper = {
  async click(input: NormalizedPointInput): Promise<string> {
    const point = await moveTo(input)
    if (isLinux) {
      await runLinuxMouse(['click', '1'])
    } else if (isMac) {
      await unsupported('Mouse click')
    } else if (isWin) {
      await unsupported('Mouse click')
    }

    return `已点击归一化坐标 (${input.x}, ${input.y}) -> 全局坐标 (${point.x}, ${point.y})`
  },

  async rightClick(input: NormalizedPointInput): Promise<string> {
    const point = await moveTo(input)
    if (isLinux) {
      await runLinuxMouse(['click', '3'])
    } else {
      await unsupported('Mouse right click')
    }

    return `已右键点击归一化坐标 (${input.x}, ${input.y}) -> 全局坐标 (${point.x}, ${point.y})`
  },

  async doubleClick(input: NormalizedPointInput): Promise<string> {
    const point = await moveTo(input)
    if (isLinux) {
      await runLinuxMouse(['click', '--repeat', '2', '--delay', '100', '1'])
    } else {
      await unsupported('Mouse double click')
    }

    return `已双击归一化坐标 (${input.x}, ${input.y}) -> 全局坐标 (${point.x}, ${point.y})`
  },

  async hover(input: NormalizedPointInput): Promise<string> {
    const point = await moveTo(input)
    return `已将鼠标移动到归一化坐标 (${input.x}, ${input.y}) -> 全局坐标 (${point.x}, ${point.y})`
  }
}
