import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export async function runCommand(command: string, args: string[] = []): Promise<string> {
  const result = await execFileAsync(command, args, { encoding: 'utf-8' })
  return result.stdout?.trim() ?? ''
}

export async function commandExists(command: string): Promise<boolean> {
  try {
    await runCommand('bash', ['-lc', `command -v ${command}`])
    return true
  } catch {
    return false
  }
}

export async function requireCommand(command: string, feature: string): Promise<void> {
  if (!(await commandExists(command))) {
    throw new Error(`${feature} requires command \`${command}\` to be installed on this system`)
  }
}
