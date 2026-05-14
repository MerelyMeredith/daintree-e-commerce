const fastify = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const routes = require('./routes')

fastify.register(cors, {
  origin: true, // en dev permite todo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
})

// luego rutas
fastify.register(routes)

const start = async () => {
  try {
    await fastify.listen({
      port: 4000,
      host: '0.0.0.0'
    })

    console.log('API running on http://localhost:4000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()