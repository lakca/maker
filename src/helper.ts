import { readFile, stat, readdir, writeFile, fstat, exists, mkdir, mkdirSync, existsSync } from 'fs'
import { promisify } from 'util';
import { dirname, extname, join, sep } from 'path';
import { safeLoad } from 'js-yaml'
import crypto from 'crypto'
const aes = require('crypto-js/aes')
const core = require('crypto-js/core')

const statAsync = promisify(stat)
const readFileAsync = promisify(readFile)
const readdirAsync = promisify(readdir)
const writeFileAsync = promisify(writeFile)
const existsAsync = promisify(exists)
const mkdirAsync = promisify(mkdir)

export async function readFileTextAsync(filename): Promise<string> {
  const buf = await readFileAsync(filename)
  return buf.toString()
}

export async function isFileAsync(file): Promise<boolean> {
  const fileStat = await statAsync(file)
  return fileStat.isFile()
}

export async function writeFileRecursiveAsync(filename, content?) {
  const folders: string[] = []
  let folder = dirname(filename)
  while (folder && !existsSync(folder)) {
    folders.push(folder)
    const i = folder.lastIndexOf(sep)
    if (i < 0) break;
    folder = folder.slice(0, i)
  }
  for (let i = folders.length; i--;) {
    mkdirSync(folders[i])
  }
  if (content == void 0) {
    return mkdirSync(filename)
  } else {
    return writeFileAsync(filename, content)
  }
}

export function renderSimpleTemplate(tmpl, params, delimiter = ['{', '}']) {
  const [ l, r ] = delimiter
  return tmpl.replace(new RegExp(`${l}\\s*([^\\s${l}${r}]+)\\s*${r}`, 'g'),
  (howtoignoreunusedparameterdeclarationThisrulemakejsnonjs, key) => params[key])
}

export async function loadConfigFromFileAsync(file) {
  if (!await existsAsync(file))
    return
  switch (extname(file)) {
    case '.json':
    case '.js':
      return Promise.resolve(require(file))
    case '.yaml':
    case '.yml':
      return safeLoad((await readFileAsync(file)).toString())
    default:
      throw new Error('unrecognized configuration file.')
  }
}

export async function eachFile(folder, depth: number = Infinity) {
  const files: any[] = []
  async function eachLevel(folder, prefix, level) {
    if (!level) return
    for (const file of await readdirAsync(folder)) {
      const filename = join(folder, file)
      if ((await statAsync(filename)).isDirectory()) {
        await eachLevel(filename, prefix.concat([file]), level - 1)
      } else {
        files.push([file, ...prefix])
      }
    }
  }
  await eachLevel(folder, [], depth)
  return files
}

export function md5(data: string|Buffer) {
  return crypto.createHash('md5').update(data).digest('hex')
}

export function encrypt(passcode, data) {
  return aes.encrypt(passcode, data).toString()
}

export function decrypt(passcode, data) {
  return aes.decrypt(passcode, data).toString()
}