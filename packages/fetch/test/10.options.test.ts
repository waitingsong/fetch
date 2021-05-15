/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { basename } from '@waiting/shared-core'

import {
  getGloalRequestOptions,
  setGloalRequestOptions,
  Options,
  initialOptions,
} from '../src/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)
const defaultOptions: Readonly<Options> = getGloalRequestOptions()

describe(filename, () => {
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

