/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// @ts-nocheck
import { abortableFetch } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
import _fetch from 'node-fetch'

import { Args } from './types'

/**
 * Patched with AbortSignal
 */
export const patchedFetch = abortableFetch(_fetch).fetch as Args['fetchModule']

export { AbortController as _AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
export { Headers as Node_Headers } from 'node-fetch'

