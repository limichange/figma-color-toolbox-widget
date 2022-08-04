const { widget } = figma

const { h, useSyncedState } = widget

const { Input } = widget

export interface NumberInputProps {}

export const NumberInput: FunctionalWidget<NumberInputProps> = () => {
  const [text, setText] = useSyncedState('text', '')

  return h(Input, {
    value: text,
    placeholder: 'Enter a number',
    inputBehavior: 'wrap',
    inputFrameProps: {
      fill: '#fee2e2',
      stroke: '#b91c1c',
      cornerRadius: 16,
      padding: 20,
    },
    width: 500,
    fill: '#7f1d1d',
    fontSize: 64,
    onTextEditEnd: (e: any) => {
      setText(e.characters)
    },
  })
}
