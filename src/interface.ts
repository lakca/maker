
export interface configInterface {
  web_root?: string
  theme?: string
  output?: string
  post_name: string

  use_permalink?: boolean
  has_catagory?: boolean
  has_tag?: boolean
  has_search?: boolean

  title?: string
  description?: string
  keywords?: string[]

  silent?: boolean
}

export interface contextInterface extends configInterface {
  cwd: string
  [x: string]: any
}

export interface postMetaInterface {
  title?: string
  description?: string
  keywords?: string[]
  categories?: string[]
  tags?: string[]
  passcode?: string
  asset?: string
}

export interface optionsInterface extends postMetaInterface {
  cwd: string
  file: string
  configFile?: string
  output?: string
  silent?: boolean
}

export interface postObject {
  id: string|number
  title: string
  content: string
  keywords: string[]
  categories: string[]
  tags: string[]
  author: string
  permalink: string
  date: Date
}

export interface contextObject {
  stringifyAttributes(attr?: object): string
}