import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {Card, Flex, Text} from '@sanity/ui'
import {useFormValue, type StringFieldProps} from 'sanity'

/**
 * Shown above the alt-text field inside the native image editor: confirms autosave and
 * how to leave the dialog, kept visually separate from the quieter alt-text help.
 */
export function ImageSavedNotice(props: StringFieldProps) {
  const asset = useFormValue([...props.path.slice(0, -1), 'asset'])

  return (
    <div style={{display: 'grid', gap: 20}}>
      {Boolean(asset) && (
        <Card tone="positive" border radius={2} style={{padding: 16}}>
          <Flex gap={3} align="flex-start">
            <Text size={2}>
              <CheckmarkCircleIcon />
            </Text>
            <div style={{display: 'grid', gap: 10}}>
              <Text size={2} weight="semibold">
                Imagen guardada automáticamente
              </Text>
              <Text size={1}>Cuando termines, cierra esta ventana con la X.</Text>
              <Text size={1} muted>
                No necesitas pulsar «Publicar» para guardar la imagen.
              </Text>
            </div>
          </Flex>
        </Card>
      )}
      {props.renderDefault(props)}
    </div>
  )
}
