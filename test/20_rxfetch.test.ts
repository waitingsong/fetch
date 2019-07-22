import { basename } from '@waiting/shared-core'
import * as assert from 'power-assert'

import { fetch, RxRequestInit } from '../src/index'


const filename = basename(__filename)

describe(filename, () => {
  describe('Should rxfetch() throw error with invalid input', () => {
    const initArgs = <RxRequestInit> {
      dataType: 'text',
    }

    it('with blank string', (resolve) => {
      const args = { ...initArgs }

      fetch('', args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

    it('with null', (resolve) => {
      const args = { ...initArgs }

      // @ts-ignore
      fetch(null, args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

    it('with undefined', (resolve) => {
      const args = { ...initArgs }

      // @ts-ignore
      fetch(undefined, args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

  })


  describe('Should rxfetch() throw error with invalid parameter init', () => {
    const url = 'https://httpbin.org/get'
    const initArgs = <RxRequestInit> {
      dataType: 'text',
    }
    initArgs.fetchModule = void 0

    it('with invalid fetchModule', (resolve) => {
      const args = { ...initArgs }
      // @ts-ignore
      args.fetchModule = 'should Function'

      fetch(url, args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
          resolve()
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })
  })

})
