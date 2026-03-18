import ScreenshotButton from '@renderer/pages/home/Inputbar/tools/components/ScreenshotButton'
import { defineTool, registerTool, TopicType } from '@renderer/pages/home/Inputbar/types'

const screenshotTool = defineTool({
  key: 'screenshot',
  label: (t) => t('chat.input.screenshot.capture'),
  visibleInScopes: [TopicType.Chat, TopicType.Session, 'mini-window'],
  dependencies: {
    state: ['files', 'couldAddImageFile'] as const,
    actions: ['setFiles'] as const
  },
  render: (context) => {
    const { state, actions } = context

    if (!state.couldAddImageFile) {
      return null
    }

    return <ScreenshotButton files={state.files} setFiles={actions.setFiles} />
  }
})

registerTool(screenshotTool)

export default screenshotTool
