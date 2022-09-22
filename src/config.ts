import deepmerge from 'deepmerge'
import _debug from 'debug'
import { createConfigLoader } from 'unconfig'
import type { CommonOptions } from './types'
import { toArray } from './utils/toArray'

const debug = _debug('taze:config')

export const LOGLEVELS = ['debug', 'info', 'warn', 'error', 'silent']

function normalizeConfig<T extends CommonOptions>(options: T) {
  options.ignorePaths = toArray(options.ignorePaths)
  options.exclude = toArray(options.exclude)
  options.include = toArray(options.include)

  if (options.silent)
    options.loglevel = 'silent'

  return options
}

export async function resolveConfig<T extends CommonOptions>(options: T): Promise<T> {
  options = normalizeConfig(options)

  // https://www.npmjs.com/package/unconfig
  const loader = createConfigLoader<CommonOptions>({
    sources: [
      {
        files: [
          'taze.config',
          // default extensions ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
        ],
      },
      {
        files: [
          '.tazerc',
        ],
        extensions: ['json', ''],
      },
    ],
    cwd: options.cwd || process.cwd(),
    merge: false,
  })

  const config = await loader.load()

  if (!config.sources.length)
    return options

  debug(`config file found ${config.sources[0]}`)
  const configOptions = normalizeConfig(config.config)

  return deepmerge(configOptions, options) as T
}
