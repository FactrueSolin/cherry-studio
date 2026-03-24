export interface ComputerUseRuntimeState {
  enabled: boolean
  running: boolean
  round: number
  maxRounds: number
  lastScreenshotHash?: string
  lastFocusedApp?: string
}

export interface ComputerUseMessageTextPart {
  type: 'text'
  text: string
}

export interface ComputerUseMessageImagePart {
  type: 'image_url'
  image_url: {
    url: string
  }
}

export type ComputerUseUserContentPart = ComputerUseMessageTextPart | ComputerUseMessageImagePart

export interface ComputerUseUserMessageInput {
  taskGoal: string
  screenshotDataUrl?: string
  screenUnchangedHint?: string
  appShortcutsContext?: string
  round: number
}

export interface ComputerUsePromptContext {
  assistantPrompt?: string
  availableTools: Array<{ name: string; description?: string }>
  runningApplications?: string[]
}
