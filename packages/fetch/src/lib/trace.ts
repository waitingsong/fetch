import type { Attributes, Span } from '@opentelemetry/api'


/**
 * Trace event
 */
export function trace(
  eventName: string,
  span?: Span,
  data?: Attributes,
): void {

  if (! span) { return }

  const input: Attributes = {
    ...data,
  }
  span.addEvent(eventName, input)
}

