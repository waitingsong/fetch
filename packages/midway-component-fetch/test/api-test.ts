import { ConfigKey } from '##/lib/types.js'


export const apiBase = {
  root: '/',
  prefix: `/_${ConfigKey.namespace}`,
  demo: '/demo',
  fetch: '/fetch',
}

export const apiMethod = {
  root: '/',
  hello: 'hello',
  component: 'component',
  ip: 'ip',
  self: 'self',
}
