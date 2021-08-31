import type { SpanLogInput } from '@mw-components/jaeger'
import { genISO8601String } from '@waiting/shared-core'
import type { Span } from 'opentracing'


export function traceLog(
  eventName: string,
  span?: Span,
  data?: SpanLogInput,
): void {

  if (! span) { return }

  const time = genISO8601String()
  const input: SpanLogInput = {
    event: eventName,
    time,
    ...data,
  }
  span.log(input)
}

