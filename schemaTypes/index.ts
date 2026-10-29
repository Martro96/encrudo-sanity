import {category} from './documents/category'
import {product} from './documents/product'
import {siteSettings} from './documents/siteSettings'
import {tag} from './documents/tag'
import {galleryImage} from './objects/galleryImage'
import {pricing} from './objects/pricing'
import {productVariant} from './objects/productVariant'
import {socialLink} from './objects/socialLink'

export const schemaTypes = [
  product,
  category,
  tag,
  siteSettings,
  productVariant,
  pricing,
  galleryImage,
  socialLink,
]
