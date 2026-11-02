import {defineArrayMember} from 'sanity'

/**
 * Constrained Portable Text for website copy: paragraphs only, plus one semantic mark.
 * "Destacado" is stored as `em`, which the frontend styles with the brand accent
 * (colour, weight and typography stay in the design system).
 */
export const editorialBlock = ({bulletList = false}: {bulletList?: boolean} = {}) =>
  defineArrayMember({
    type: 'block',
    styles: [{title: 'Normal', value: 'normal'}],
    lists: bulletList ? [{title: 'Viñetas', value: 'bullet'}] : [],
    marks: {
      decorators: [{title: 'Destacado', value: 'em'}],
      annotations: [],
    },
  })

export const EDITORIAL_HELP =
  'Selecciona una palabra o frase y pulsa "Destacado" para resaltarla con el color de la marca. Mayús+Intro hace un salto de línea dentro del mismo párrafo.'
