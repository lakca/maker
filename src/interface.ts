
export interface configInterface {
  web_root: string
  theme: string
  output: string

  use_permalink?: boolean
  has_catagory?: boolean
  has_tag?: boolean
  has_search?: boolean

  title?: string
  description?: string
  keywords?: [string]
}

export interface postInterface {
  title?: string
  description?: string
  keywords?: [string]
  categories?: [string]
  tags?: [string]
  passcode?: string
  asset?: string
}

export interface optionsInterface extends postInterface {
  cwd: string
  file: string
  configFile?: string
  output?: string
  silent?: boolean
}

export interface contextInterface extends configInterface, optionsInterface { }

export interface post {
  id: string|number
  title: string
  content: string
  keywords: [string]
  categories: [string]
  tags: [string]
  author: string
  permalink: string
  date: number
}

export interface globalMethod {
  stringifyAttributes(attr?: object): string
}