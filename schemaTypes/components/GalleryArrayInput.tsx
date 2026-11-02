import {AddIcon} from '@sanity/icons/Add'
import {UploadIcon} from '@sanity/icons/Upload'
import {Button, Flex} from '@sanity/ui'
import {useMemo, useRef, type ChangeEvent} from 'react'
import type {ArrayInputFunctionsProps, ArrayOfObjectsInputProps, ArraySchemaType, SchemaType} from 'sanity'

type Item = {_key: string}

/**
 * Image array input with clearer actions: "Seleccionar varias imágenes" (multi-file picker)
 * and "Añadir otra imagen". Uploads go through the array's own uploader (the same path
 * Sanity uses for drag-and-drop), so no asset logic is duplicated here.
 */
export function GalleryArrayInput(props: ArrayOfObjectsInputProps) {
  const {onUpload, resolveUploader} = props

  const arrayFunctions = useMemo(
    () =>
      function GalleryFunctions(fnProps: ArrayInputFunctionsProps<Item, ArraySchemaType>) {
        const {schemaType, readOnly, value, onItemAppend, onValueCreate} = fnProps
        const fileInput = useRef<HTMLInputElement>(null)
        const itemType = schemaType.of[0] as SchemaType
        const canUpload = Boolean(onUpload && resolveUploader)

        const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
          for (const file of Array.from(event.target.files ?? [])) {
            const uploader = resolveUploader?.(itemType as never, file)
            if (uploader) onUpload?.({file, schemaType: itemType, uploader: uploader as never})
          }
          event.target.value = ''
        }

        return (
          <Flex gap={1} wrap="wrap">
            {canUpload && (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFiles}
                />
                <Button
                  style={{flex: 1}}
                  icon={UploadIcon}
                  mode="ghost"
                  text="Seleccionar varias imágenes"
                  disabled={readOnly}
                  onClick={() => fileInput.current?.click()}
                />
              </>
            )}
            <Button
              style={{flex: 1}}
              icon={AddIcon}
              mode="ghost"
              text={value?.length ? 'Añadir otra imagen' : 'Añadir imagen'}
              disabled={readOnly}
              onClick={() => onItemAppend(onValueCreate(itemType as unknown as ArraySchemaType) as Item)}
            />
          </Flex>
        )
      },
    [onUpload, resolveUploader],
  )

  return props.renderDefault({...props, arrayFunctions})
}
