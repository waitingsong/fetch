
export const tracerConfig = {
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: process.env['JAEGER_SAMPLE_RATIO'] ? +process.env['JAEGER_SAMPLE_RATIO'] : 1,
    },
    reporter: {
      agentHost: process.env['JAEGER_AGENT_HOST'] ?? '192.168.1.248',
    },
  },
}
