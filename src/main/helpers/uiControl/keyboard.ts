import { isLinux, isMac, isWin } from '@main/constant'

import { requireCommand, runCommand } from './process'

const KEY_ALIASES: Record<string, string> = {
  enter: 'Return',
  return: 'Return',
  esc: 'Escape',
  escape: 'Escape',
  space: 'space',
  tab: 'Tab',
  backspace: 'BackSpace',
  delete: 'Delete',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  home: 'Home',
  end: 'End',
  pageup: 'Prior',
  pagedown: 'Next'
}

const MODIFIER_ALIASES: Record<string, string> = {
  cmd: 'Super',
  command: 'Super',
  ctrl: 'ctrl',
  control: 'ctrl',
  shift: 'shift',
  alt: 'alt',
  option: 'alt',
  super: 'Super'
}

function normalizeKey(key: string): string {
  const normalized = key.trim().toLowerCase()
  return KEY_ALIASES[normalized] ?? (normalized.length === 1 ? normalized : key)
}

function normalizeModifier(modifier: string): string {
  const normalized = modifier.trim().toLowerCase()
  return MODIFIER_ALIASES[normalized] ?? modifier
}

async function runLinuxKey(args: string[]): Promise<void> {
  await requireCommand('xdotool', 'Keyboard control')
  await runCommand('xdotool', args)
}

async function unsupported(feature: string): Promise<never> {
  throw new Error(`${feature} is not implemented for the current platform`)
}

export const keyboardHelper = {
  async typeText({ text }: { text: string }): Promise<string> {
    if (isLinux) {
      await runLinuxKey(['type', '--delay', '1', text])
    } else if (isMac || isWin) {
      await unsupported('Keyboard typeText')
    }

    return `已输入文本: ${text}`
  },

  async pressKey({ key }: { key: string }): Promise<string> {
    const normalizedKey = normalizeKey(key)
    if (isLinux) {
      await runLinuxKey(['key', normalizedKey])
    } else {
      await unsupported('Keyboard pressKey')
    }

    return `已按下按键: ${key}`
  },

  async hotkey({ modifiers, key }: { modifiers: string[]; key: string }): Promise<string> {
    const normalizedKey = normalizeKey(key)
    const combo = [...modifiers.map(normalizeModifier), normalizedKey].join('+')
    if (isLinux) {
      await runLinuxKey(['key', combo])
    } else {
      await unsupported('Keyboard hotkey')
    }

    return `已执行组合键: ${modifiers.join('+')} + ${key}`
  }
}
