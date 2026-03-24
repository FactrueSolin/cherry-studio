import ComputerUseButton from '@renderer/pages/home/Inputbar/tools/components/ComputerUseButton'
import { defineTool, registerTool, TopicType } from '@renderer/pages/home/Inputbar/types'

const computerUseTool = defineTool({
  key: 'computer_use',
  label: (t) => t('chat.input.computer_use.label'),
  visibleInScopes: [TopicType.Chat, TopicType.Session, 'mini-window'],
  dependencies: {
    state: ['computerUseEnabled', 'computerUseRunning'] as const,
    actions: ['setComputerUseEnabled'] as const
  },
  render: ({ state, actions }) => (
    <ComputerUseButton
      enabled={state.computerUseEnabled}
      running={state.computerUseRunning}
      onToggle={() => actions.setComputerUseEnabled((prev) => !prev)}
    />
  )
})

registerTool(computerUseTool)

export default computerUseTool
