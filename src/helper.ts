import { readFile, stat, readdir, writeFile, fstat, exists, mkdir } from 'fs'
import { promisify } from 'util';
import { dirname } from 'path';
const statAsync = promisify(stat)
const readFileAsync = promisify(readFile)
const readdirAsync = promisify(readdir)
const writeFileAsync = promisify(writeFile)
const existsAsync = promisify(exists)
const mkdirAsync = promisify(mkdir)

export { writeFileAsync }

export async function readFileText(filename): Promise<string> {
  const buf = await readFileAsync(filename)
  return buf.toString()
}

export async function isFile(file): Promise<boolean> {
  const fileStat = await statAsync(file)
  return fileStat.isFile()
}

export async function writeFileRecursive(filename, text): Promise<void> {
  const folders: string[] = []
  let folder = dirname(filename)
  while (folder && !await existsAsync(folder)) {
    folders.push(folder)
    const i = folder.lastIndexOf('/')
    if (i < 0) break;
    folder = folder.slice(0, i)
  }
  for (const f of folders) {
    await mkdirAsync(f)
  }
  return writeFileAsync(filename, text)
}

export function parseSimpleTemplate(tmpl, params, delimiter = ['{', '}']) {
  const [ l, r ] = delimiter
  return tmpl.replace(new RegExp(`${l}\\s*([^\\s${l}${r}]+)\\s*${r}`, 'g'),
  (howtoignoreunusedparameterdeclarationThisrulemakejsnonjs, key) => (console.log(key, key.length), params[key]))
}