/* eslint-disable @typescript-eslint/restrict-template-expressions */
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  getGloalRequestOptions,
  setGloalRequestOptions,
  Options,
} from '../src/index.js'
import { initialOptions } from '../src/lib/config.js'


const defaultOptions: Readonly<Options> = getGloalRequestOptions()

describe(fileShortPath(import.meta.url), () => {
  afterEach(() => {
    setGloalRequestOptions(defaultOptions)
  })

  describe('Should getGloalRequestInit() work', () => {
    const initData = getGloalRequestOptions()

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
          break
        }
      }
    })
  })


  describe('Should setGloalRequestInit() work', () => {
    it('change method to POST', () => {
      const method = 'POST'
      setGloalRequestOptions({ method })
      const initData = getGloalRequestOptions()

      assert(initData && initData.method === method)
    })

    it('change mode to no-cors', () => {
      const { mode: oriMode } = getGloalRequestOptions()
      const mode = 'no-cors'
      assert(oriMode !== mode)
      setGloalRequestOptions({ mode })
      const { mode: curMode } = getGloalRequestOptions()

      assert(curMode === mode)
    })

    it('change timeout', () => {
      const timeout = Math.ceil(Math.random() * 100)
      setGloalRequestOptions({ timeout })
      const initData = getGloalRequestOptions()

      assert(initData && initData.timeout === timeout)
    })
  })

})

