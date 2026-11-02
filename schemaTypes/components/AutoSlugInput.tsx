import {useEffect, useRef} from 'react'
import {getPublishedId, set, unset, useEditState, useFormValue, type SlugInputProps} from 'sanity'
import {slugify} from '../lib/slug'

/**
 * Slug input that follows the title while the document has never been published.
 * It stops following once the editor types a custom slug or the document is published,
 * so live URLs never change silently. The native field (and "Generar") stays available.
 */
export function AutoSlugInput(props: SlugInputProps) {
  const {onChange, readOnly, value} = props
  const title = useFormValue(['title']) as string | undefined
  const id = (useFormValue(['_id']) as string | undefined) ?? ''
  const type = (useFormValue(['_type']) as string | undefined) ?? ''
  const {ready, published} = useEditState(getPublishedId(id), type, 'low')
  const previousTitle = useRef(title)

  useEffect(() => {
    const previous = previousTitle.current
    previousTitle.current = title
    if (!ready || published || readOnly) return

    const current = value?.current
    const followsTitle = !current || current === slugify(previous ?? '')
    const next = slugify(title ?? '')
    if (!followsTitle || next === (current ?? '')) return

    onChange(next ? set({_type: 'slug', current: next}) : unset())
  }, [title, ready, published, readOnly, value, onChange])

  return props.renderDefault(props)
}
