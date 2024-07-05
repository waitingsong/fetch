/* eslint-disable @typescript-eslint/restrict-template-expressions */
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import type { Options } from '../src/index.js'
import {
  getGlobalRequestOptions,
  setGlobalRequestOptions,
} from '../src/index.js'
import { initialOptions } from '../src/lib/config.js'


const defaultOptions: Readonly<Options> = getGlobalRequestOptions()

describe(fileShortPath(import.meta.url), () => {
  afterEach(() => {
    setGlobalRequestOptions(defaultOptions)
  })

  describe('Should getGlobalRequestInit() work', () => {
    const initData = getGlobalRequestOptions()

    it('result is copy of initialOptions', () => {
      assert(initData && initData !== initialOptions)
    })

    it('values of result equal to initialOptions', () => {
      for (const [key, value] of Object.entries(initData)) {
        if (key in initialOptions) {
          const dd = Object.getOwnPropertyDescriptor(initialOptions, key)
          assert(dd && value === dd.value, `key: "${key}": not equal`)
        }
        else {
          assert(false, `${key} not exists in initialOptions`)
        }
      }
    })
  })


  describe('Should setGlobalRequestInit() work', () => {
    it('change method to POST', () => {
      const method = 'POST'
      setGlobalRequestOptions({ method })
      const initData = getGlobalRequestOptions()

      assert(initData && initData.method === method)
    })

    it('change mode to no-cors', () => {
      const { mode: oriMode } = getGlobalRequestOptions()
      const mode = 'no-cors'
      assert(oriMode !== mode)
      setGlobalRequestOptions({ mode })
      const { mode: curMode } = getGlobalRequestOptions()

      assert(curMode === mode)
    })

    it('change timeout', () => {
      const timeout = Math.ceil(Math.random() * 100)
      setGlobalRequestOptions({ timeout })
      const initData = getGlobalRequestOptions()

      assert(initData && initData.timeout === timeout)
    })
  })

})

