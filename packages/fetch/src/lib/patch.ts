/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import _fetch, { Headers as _Headers } from 'node-fetch'

import { Args } from './types.js'


export const patchedFetch = _fetch as unknown as Args['fetchModule']

export const Node_Headers = _Headers as unknown as typeof Headers

