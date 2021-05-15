
export function assertNever(x: unknown): never {
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  throw new Error('Assert Never Unexpected object: ' + x)
}

