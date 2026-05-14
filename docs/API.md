## APIS - backend
El esquema:
```bash
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())

  orders    Order[]
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  products Product[]
}

model Product {
  id          Int         @id @default(autoincrement())
  name        String
  description String      @db.Text
  price       Float
  stock       Int         @default(0)
  image       String      @default("")
 active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  categoryId  Int?
  category    Category?   @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
}

model ShippingMethod {
  id            Int      @id @default(autoincrement())
  name          String
  description   String
  price         Float
  estimatedDays Int
  active        Boolean  @default(true)

  orders        Order[]
}

model Order {
  id               Int            @id @default(autoincrement())
  userId           Int
  shippingMethodId Int
  total            Float
  status           String         @default("pending")
  paymentMethod    String         @default("cash")
  shippingAddress  String         @db.Text
  createdAt        DateTime       @default(now())
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  shippingMethod   ShippingMethod @relation(fields: [shippingMethodId], references: [id], onDelete: Restrict)
  items            OrderItem[]
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
  price     Float
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Restrict)
}
```

Configuracion de las rutas
```bash
const prisma = require('./prisma')

async function routes(fastify) {

  // =====================
  // HEALTH
  // =====================
  fastify.get('/health', async () => {
    return { ok: true }
  })

 // =====================
  // USERS
  // =====================
  fastify.get('/users', async () => {
    return prisma.user.findMany()
  })

  fastify.post('/users', async (req) => {
    return prisma.user.create({ data: req.body })
  })

  /**
   * DELETE /users/:id
   * Elimina el usuario junto con todas sus órdenes e ítems de orden (cascada manual).
   * Prisma no ejecuta cascada automáticamente a menos que esté configurado en el schema.
   */
  fastify.delete('/users/:id', async (req, reply) => {
    const id = parseInt(req.params.id)

    // 1. Borrar los OrderItems de todas las órdenes del usuario
    await prisma.orderItem.deleteMany({
      where: { order: { userId: id } }
    })

    // 2. Borrar las órdenes del usuario
    await prisma.order.deleteMany({
      where: { userId: id }
    })

    // 3. Borrar el usuario
    await prisma.user.delete({ where: { id } })

    return reply.code(204).send()
  })

  // =====================
// CATEGORIES
// =====================
fastify.get('/categories', async () => {
  return prisma.category.findMany()
})

fastify.post('/categories', async (req, reply) => {
  const { name } = req.body
  try {
    return await prisma.category.create({ data: { name } })
  } catch (e) {
    if (e.code === 'P2002') {
      return reply.code(409).send({ error: `La categoría "${name}" ya existe.` })
    }
    throw e
  }
})

fastify.delete('/categories/:id', async (req, reply) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.category.delete({ where: { id } })
    return reply.code(204).send()
  } catch (e) {
    if (e.code === 'P2025') {
      return reply.code(404).send({ error: 'Categoría no encontrada.' })
    }
    throw e
  }
})

  // =====================
  // PRODUCTS
  // =====================
  fastify.get('/products', async () => {
    return prisma.product.findMany({ include: { category: true } })
  })

  fastify.post('/products', async (req) => {
    const { name, description, price, stock, image, categoryId } = req.body
    return prisma.product.create({
      data: { name, description, price, stock, image, categoryId }
    })
  })

  /**
   * DELETE /products/:id
   * Elimina primero los OrderItems que referencian el producto,
   * luego elimina el producto.
   */
  fastify.delete('/products/:id', async (req, reply) => {
    const id = parseInt(req.params.id)

    // Borrar ítems de órdenes que contengan este producto
    await prisma.orderItem.deleteMany({
      where: { productId: id }
    })

    await prisma.product.delete({ where: { id } })

    return reply.code(204).send()
  })

  // =====================
  // SHIPPING METHODS
  // =====================
  fastify.get('/shipping', async () => {
    return prisma.shippingMethod.findMany()
  })

  fastify.post('/shipping', async (req) => {
    const { name, description, price, estimatedDays } = req.body
    return prisma.shippingMethod.create({
      data: { name, description, price, estimatedDays }
    })
  })

  /**
   * DELETE /shipping/:id
   * No se puede eliminar un método de envío si hay órdenes que lo usan.
   * Se devuelve un error 409 en ese caso.
   */
  fastify.delete('/shipping/:id', async (req, reply) => {
    const id = parseInt(req.params.id)

    const ordersUsingMethod = await prisma.order.count({
      where: { shippingMethodId: id }
    })

    if (ordersUsingMethod > 0) {
      return reply.code(409).send({
        error: 'No se puede eliminar: hay órdenes que usan este método de envío.'
      })
    }

    await prisma.shippingMethod.delete({ where: { id } })

    return reply.code(204).send()
  })

  // =====================
  // ORDERS
  // =====================
  fastify.get('/orders', async () => {
    return prisma.order.findMany({
      include: { items: true, user: true, shippingMethod: true }
    })
  })

  fastify.post('/orders', async (req) => {
    const { userId, shippingMethodId, total, shippingAddress, items } = req.body
    return prisma.order.create({
      data: {
        userId,
        shippingMethodId,
        total,
        shippingAddress,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: true }
    })
  })

  /**
   * DELETE /orders/:id
   * Elimina primero los ítems de la orden (cascada manual) y luego la orden.
   */
  fastify.delete('/orders/:id', async (req, reply) => {
    const id = parseInt(req.params.id)

    // Borrar ítems de la orden primero
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    })

    await prisma.order.delete({ where: { id } })

    return reply.code(204).send()
  })

}

module.exports = routes
```

## Users

Consulta de todos los usuarios (get)
```bash
curl http://localhost:4000/users
```

Consulta de un usuario
```bash
curl http://localhost:4000/users/1
```

Creacion de un usuario
```bash
curl -X POST http://localhost:4000/users -H "Content-Type: application/json" -d '{"name":"Ana López","email":"ana@ejemplo.com","password":"segura1234","role":"user"}'
```

Actualizacion de campos de un usuario
```bash
curl -X PUT http://localhost:4000/users/1 -H "Content-Type: application/json" -d '{"name":"Ana Ruiz","email":"ana.nueva@ejemplo.com","role":"admin"}'
```

Actualizacion de contrasena (probar si funciona, contra hasheada)
```bash
curl -X PUT http://localhost:4000/users/1/password -H "Content-Type: application/json" -d '{"password":"nuevaSegura99"}'
```


## Category 

Obtener todas las categorias
```bash
curl http://localhost:4000/categories
```

Ingresar una nueva categoria 
```bash
curl -X POST http://localhost:4000/categories -H "Content-Type: application/json" -d '{"name":"Periféricos"}'
```

Traer una categoria en especifico con todos sus productos 
```bash
curl -X POST http://localhost:4000/categories -H "Content-Type: application/json" -d '{"name":"Periféricos"}'
```
Actualizar el nombre de una categoria 
```bash
curl -X PUT http://localhost:4000/categories/1 -H "Content-Type: application/json" -d '{"name":"Periféricos Gaming"}'
```
Eliminar una categoria
```bash
curl http://localhost:4000/categories
```

## Shipping

Obtener todos los metodos de shipping
```bash
curl http://localhost:4000/shipping
```

Mandar traer un metodo de shipping
```bash
curl http://localhost:4000/shipping/1
```
Crear un metodo de shipping
```bash
curl -X POST http://localhost:4000/shipping -H "Content-Type: application/json" -d '{"name":"Estándar","description":"Entrega en 5-7 días","price":99,"estimatedDays":7}'
```
Modificar un metodo de shipping
```bash
curl -X PUT http://localhost:4000/shipping/1 -H "Content-Type: application/json" -d '{"price":79,"estimatedDays":6,"active":true}'
```