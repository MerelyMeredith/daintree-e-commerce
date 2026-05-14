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
  cart      Cart?         // ← carrito ligado al usuario
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
  category    Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  orderItems  OrderItem[]
  cartItems   CartItem[]  // ← productos en carritos
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

model Cart {
  id        Int        @id @default(autoincrement())
  userId    Int        @unique          // un solo carrito por usuario
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
}

model CartItem {
  id        Int     @id @default(autoincrement())
  cartId    Int
  productId Int
  quantity  Int     @default(1)
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])  // un producto no se repite en el mismo carrito
}
```

Configuracion de las rutas
```bash
const prisma = require('./prisma')
const bcrypt = require('bcrypt')

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
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
      // password excluido siempre
    })
  })

  fastify.get('/users/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })
    if (!user) return reply.code(404).send({ error: 'Usuario no encontrado.' })
    return user
  })

  fastify.post('/users', async (req, reply) => {
    const { name, email, password, role } = req.body

    if (!name?.trim())     return reply.code(400).send({ error: 'El nombre es obligatorio.' })
    if (!email?.trim())    return reply.code(400).send({ error: 'El email es obligatorio.' })
    if (!password || password.length < 8)
      return reply.code(400).send({ error: 'La contraseña debe tener al menos 8 caracteres.' })

    try {
      const hashed = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: { name: name.trim(), email: email.trim(), password: hashed, role: role ?? 'user' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      })
      return reply.code(201).send(user)
    } catch (e) {
      if (e.code === 'P2002') return reply.code(409).send({ error: 'El email ya está registrado.' })
      throw e
    }
  })

  fastify.put('/users/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const { name, email, role } = req.body

    if (!name && !email && !role)
      return reply.code(400).send({ error: 'Debes enviar al menos un campo para actualizar.' })

    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(name  && { name: name.trim() }),
          ...(email && { email: email.trim() }),
          ...(role  && { role }),
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      })
      return user
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Usuario no encontrado.' })
      if (e.code === 'P2002') return reply.code(409).send({ error: 'El email ya está en uso.' })
      throw e
    }
  })

  /**
   * PUT /users/:id/password
   * Ruta separada para cambio de contraseña — nunca mezclar con datos de perfil.
   */
  fastify.put('/users/:id/password', async (req, reply) => {
    const id = parseInt(req.params.id)
    const { password } = req.body

    if (!password || password.length < 8)
      return reply.code(400).send({ error: 'La contraseña debe tener al menos 8 caracteres.' })

    try {
      const hashed = await bcrypt.hash(password, 10)
      await prisma.user.update({ where: { id }, data: { password: hashed } })
      return reply.code(204).send()
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Usuario no encontrado.' })
      throw e
    }
  })

  /**
   * DELETE /users/:id
   * Cascada manual: OrderItems → Orders → User.
   * (El schema tiene onDelete: Cascade en Order→User, pero Prisma con MySQL
   *  a veces requiere el borrado manual por el orden de constraints.)
   */
  fastify.delete('/users/:id', async (req, reply) => {
    const id = parseInt(req.params.id)

    await prisma.orderItem.deleteMany({ where: { order: { userId: id } } })
    await prisma.order.deleteMany({ where: { userId: id } })

    try {
      await prisma.user.delete({ where: { id } })
      return reply.code(204).send()
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Usuario no encontrado.' })
      throw e
    }
  })

  // =====================
  // CATEGORIES
  // =====================

  fastify.get('/categories', async () => {
    return prisma.category.findMany({ include: { _count: { select: { products: true } } } })
  })

  fastify.get('/categories/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { products: { where: { active: true } } }
    })
    if (!cat) return reply.code(404).send({ error: 'Categoría no encontrada.' })
    return cat
  })

  fastify.post('/categories', async (req, reply) => {
    const { name } = req.body
    if (!name?.trim()) return reply.code(400).send({ error: 'El nombre es obligatorio.' })

    try {
      return reply.code(201).send(
        await prisma.category.create({ data: { name: name.trim() } })
      )
    } catch (e) {
      if (e.code === 'P2002') return reply.code(409).send({ error: `La categoría "${name}" ya existe.` })
      throw e
    }
  })

  fastify.put('/categories/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const { name } = req.body
    if (!name?.trim()) return reply.code(400).send({ error: 'El nombre es obligatorio.' })

    try {
      return await prisma.category.update({
        where: { id },
        data: { name: name.trim() }
      })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Categoría no encontrada.' })
      if (e.code === 'P2002') return reply.code(409).send({ error: `La categoría "${name}" ya existe.` })
      throw e
    }
  })

  /**
   * DELETE /categories/:id
   * Seguro porque el schema tiene onDelete: SetNull en Product→Category.
   * Los productos quedan con categoryId = null, no se borran.
   *
   * ⚠️ IMPORTANTE: asegúrate de tener onDelete: SetNull en el schema, NO Cascade.
   */
  fastify.delete('/categories/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    try {
      await prisma.category.delete({ where: { id } })
      return reply.code(204).send()
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Categoría no encontrada.' })
      throw e
    }
  })

  // =====================
  // PRODUCTS
  // =====================

  fastify.get('/products', async (req) => {
    const { category, search, onlyActive } = req.query
    return prisma.product.findMany({
      where: {
        ...(onlyActive !== 'false' && { active: true }),         // por defecto solo activos
        ...(category   && { categoryId: parseInt(category) }),
        ...(search     && { name: { contains: search } }),
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })
  })

  fastify.get('/products/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    })
    if (!product) return reply.code(404).send({ error: 'Producto no encontrado.' })
    return product
  })

  fastify.post('/products', async (req, reply) => {
    const { name, description, price, stock, image, categoryId } = req.body

    if (!name?.trim())                          return reply.code(400).send({ error: 'El nombre es obligatorio.' })
    if (price === undefined || price <= 0)      return reply.code(400).send({ error: 'El precio debe ser mayor a 0.' })
    if (stock !== undefined && stock < 0)       return reply.code(400).send({ error: 'El stock no puede ser negativo.' })

    return reply.code(201).send(
      await prisma.product.create({
        data: {
          name: name.trim(),
          description: description ?? '',
          price,
          stock: stock ?? 0,
          image: image ?? '',
          categoryId: categoryId ?? null
        },
        include: { category: true }
      })
    )
  })

  fastify.put('/products/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const { name, description, price, stock, image, categoryId, active } = req.body

    if (price !== undefined && price <= 0)
      return reply.code(400).send({ error: 'El precio debe ser mayor a 0.' })
    if (stock !== undefined && stock < 0)
      return reply.code(400).send({ error: 'El stock no puede ser negativo.' })

    try {
      return await prisma.product.update({
        where: { id },
        data: {
          ...(name        !== undefined && { name: name.trim() }),
          ...(description !== undefined && { description }),
          ...(price       !== undefined && { price }),
          ...(stock       !== undefined && { stock }),
          ...(image       !== undefined && { image }),
          ...(categoryId  !== undefined && { categoryId }),
          ...(active      !== undefined && { active }),
        },
        include: { category: true }
      })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Producto no encontrado.' })
      throw e
    }
  })

  /**
   * DELETE /products/:id
   * Si el producto tiene órdenes históricas → soft delete (active: false).
   * Si nunca fue comprado → hard delete.
   * NUNCA borramos OrderItems para no destruir historial de órdenes.
   */
  fastify.delete('/products/:id', async (req, reply) => {
    const id = parseInt(req.params.id)

    const hasOrders = await prisma.orderItem.findFirst({ where: { productId: id } })

    if (hasOrders) {
      await prisma.product.update({ where: { id }, data: { active: false } })
      return reply.code(200).send({ message: 'Producto desactivado. Tiene órdenes históricas y no puede eliminarse.' })
    }

    try {
      await prisma.product.delete({ where: { id } })
      return reply.code(204).send()
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Producto no encontrado.' })
      throw e
    }
  })

  // =====================
  // SHIPPING METHODS
  // =====================

  fastify.get('/shipping', async () => {
    return prisma.shippingMethod.findMany({ where: { active: true } })
  })

  fastify.get('/shipping/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const method = await prisma.shippingMethod.findUnique({ where: { id } })
    if (!method) return reply.code(404).send({ error: 'Método de envío no encontrado.' })
    return method
  })

  fastify.post('/shipping', async (req, reply) => {
    const { name, description, price, estimatedDays } = req.body

    if (!name?.trim())                              return reply.code(400).send({ error: 'El nombre es obligatorio.' })
    if (price === undefined || price < 0)           return reply.code(400).send({ error: 'El precio no puede ser negativo.' })
    if (!estimatedDays || estimatedDays < 1)        return reply.code(400).send({ error: 'estimatedDays debe ser al menos 1.' })

    return reply.code(201).send(
      await prisma.shippingMethod.create({
        data: { name: name.trim(), description: description ?? '', price, estimatedDays }
      })
    )
  })

  fastify.put('/shipping/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const { name, description, price, estimatedDays, active } = req.body

    if (price !== undefined && price < 0)
      return reply.code(400).send({ error: 'El precio no puede ser negativo.' })
    if (estimatedDays !== undefined && estimatedDays < 1)
      return reply.code(400).send({ error: 'estimatedDays debe ser al menos 1.' })

    try {
      return await prisma.shippingMethod.update({
        where: { id },
        data: {
          ...(name          !== undefined && { name: name.trim() }),
          ...(description   !== undefined && { description }),
          ...(price         !== undefined && { price }),
          ...(estimatedDays !== undefined && { estimatedDays }),
          ...(active        !== undefined && { active }),
        }
      })
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Método de envío no encontrado.' })
      throw e
    }
  })

  /**
   * DELETE /shipping/:id
   * Bloqueado si hay órdenes que lo usan — no se puede destruir historial.
   */
  fastify.delete('/shipping/:id', async (req, reply) => {
    const id = parseInt(req.params.id)

    const ordersUsingMethod = await prisma.order.count({ where: { shippingMethodId: id } })
    if (ordersUsingMethod > 0) {
      return reply.code(409).send({
        error: `No se puede eliminar: ${ordersUsingMethod} orden(es) usan este método. Desactívalo en su lugar.`
      })
    }

    try {
      await prisma.shippingMethod.delete({ where: { id } })
      return reply.code(204).send()
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Método de envío no encontrado.' })
      throw e
    }
  })

  // =====================
  // ORDERS
  // =====================

  fastify.get('/orders', async () => {
    return prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        shippingMethod: true,
        items: { include: { product: { select: { id: true, name: true, image: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })
  })

  fastify.get('/orders/:id', async (req, reply) => {
    const id = parseInt(req.params.id)
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        shippingMethod: true,
        items: { include: { product: { select: { id: true, name: true, image: true } } } }
      }
    })
    if (!order) return reply.code(404).send({ error: 'Orden no encontrada.' })
    return order
  })

  /**
   * GET /orders/user/:userId
   * Historial de órdenes de un usuario específico.
   */
  fastify.get('/orders/user/:userId', async (req, reply) => {
    const userId = parseInt(req.params.userId)
    return prisma.order.findMany({
      where: { userId },
      include: {
        shippingMethod: true,
        items: { include: { product: { select: { id: true, name: true, image: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })
  })

  /**
   * POST /orders
   * Checkout con transacción atómica:
   * 1. Verifica stock de cada producto
   * 2. Descuenta stock
   * 3. Calcula total en el servidor (nunca confiar en el cliente)
   * 4. Crea orden + items en una sola transacción
   */
  fastify.post('/orders', async (req, reply) => {
    const { userId, shippingMethodId, shippingAddress, paymentMethod, items } = req.body

    if (!items?.length)       return reply.code(400).send({ error: 'La orden debe tener al menos un producto.' })
    if (!shippingAddress)     return reply.code(400).send({ error: 'La dirección de envío es obligatoria.' })

    try {
      const order = await prisma.$transaction(async (tx) => {
        let total = 0
        const resolvedItems = []

        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, price: true, stock: true, active: true }
          })

          if (!product || !product.active)
            throw Object.assign(new Error(`Producto no disponible: ${product?.name ?? item.productId}`), { statusCode: 400 })

          if (product.stock < item.quantity)
            throw Object.assign(new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`), { statusCode: 400 })

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          })

          total += product.price * item.quantity
          resolvedItems.push({ productId: item.productId, quantity: item.quantity, price: product.price })
        }

        // Sumar costo de envío al total
        const shipping = await tx.shippingMethod.findUnique({
          where: { id: shippingMethodId },
          select: { price: true }
        })
        if (!shipping)
          throw Object.assign(new Error('Método de envío no válido.'), { statusCode: 400 })

        total += shipping.price

        return tx.order.create({
          data: {
            userId,
            shippingMethodId,
            shippingAddress,
            paymentMethod: paymentMethod ?? 'cash',
            total,
            items: { create: resolvedItems }
          },
          include: {
            shippingMethod: true,
            items: { include: { product: { select: { id: true, name: true } } } }
          }
        })
      })

      return reply.code(201).send(order)

    } catch (e) {
      if (e.statusCode) return reply.code(e.statusCode).send({ error: e.message })
      throw e
    }
  })

  /**
   * PUT /orders/:id/status
   * Solo se puede cambiar el status de una orden.
   * No se permite modificar items, total ni usuario — son datos históricos.
   * No se puede reactivar una orden cancelada.
   */
  fastify.put('/orders/:id/status', async (req, reply) => {
    const id = parseInt(req.params.id)
    const { status } = req.body

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status))
      return reply.code(400).send({ error: `Status inválido. Opciones: ${validStatuses.join(', ')}` })

    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } })
    if (!order) return reply.code(404).send({ error: 'Orden no encontrada.' })

    if (order.status === 'cancelled')
      return reply.code(409).send({ error: 'No se puede modificar una orden cancelada.' })

    if (order.status === 'delivered' && status !== 'cancelled')
      return reply.code(409).send({ error: 'Una orden entregada solo puede cancelarse.' })

    return prisma.order.update({ where: { id }, data: { status } })
  })

  /**
   * DELETE /orders/:id
   * Cascada manual: OrderItems → Order.
   */
  fastify.delete('/orders/:id', async (req, reply) => {
    const id = parseInt(req.params.id)

    await prisma.orderItem.deleteMany({ where: { orderId: id } })

    try {
      await prisma.order.delete({ where: { id } })
      return reply.code(204).send()
    } catch (e) {
      if (e.code === 'P2025') return reply.code(404).send({ error: 'Orden no encontrada.' })
      throw e
    }
  })

    // =====================
  // CART
  // =====================

  fastify.get('/cart/:userId', async (req, reply) => {
    const userId = parseInt(req.params.userId)

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    return cart
  })

  fastify.post('/cart/:userId/items', async (req, reply) => {
    const userId = parseInt(req.params.userId)
    const { productId, quantity = 1 } = req.body

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {}
    })

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product)
      return reply.code(404).send({ error: 'Producto no encontrado.' })

    if (product.stock < quantity)
      return reply.code(409).send({ error: `Stock insuficiente. Disponible: ${product.stock}` })

    const item = await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId }
      },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
      include: { product: true }
    })

    return reply.code(201).send(item)
  })

  fastify.patch('/cart/:userId/items/:productId', async (req, reply) => {
    const userId = parseInt(req.params.userId)
    const productId = parseInt(req.params.productId)
    const { quantity } = req.body

    const cart = await prisma.cart.findUnique({ where: { userId } })

    if (!cart)
      return reply.code(404).send({ error: 'Carrito no encontrado.' })

    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } }
      })
      return reply.code(204).send()
    }

    const item = await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
      include: { product: true }
    })

    return item
  })

  fastify.delete('/cart/:userId/items/:productId', async (req, reply) => {
    const userId = parseInt(req.params.userId)
    const productId = parseInt(req.params.productId)

    const cart = await prisma.cart.findUnique({ where: { userId } })

    if (!cart)
      return reply.code(404).send({ error: 'Carrito no encontrado.' })

    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } }
    })

    return reply.code(204).send()
  })

  fastify.delete('/cart/:userId', async (req, reply) => {
    const userId = parseInt(req.params.userId)

    const cart = await prisma.cart.findUnique({ where: { userId } })

    if (!cart)
      return reply.code(404).send({ error: 'Carrito no encontrado.' })

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return reply.code(204).send()
  })

  fastify.post('/cart/:userId/checkout', async (req, reply) => {
    const userId = parseInt(req.params.userId)
    const { shippingMethodId, shippingAddress, paymentMethod = 'cash' } = req.body

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    })

    if (!cart || cart.items.length === 0)
      return reply.code(400).send({ error: 'El carrito está vacío.' })

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return reply.code(409).send({
          error: `Stock insuficiente para "${item.product.name}". Disponible: ${item.product.stock}`
        })
      }
    }

    let total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    const order = await prisma.$transaction(async (tx) => {

      // 🔥 (MEJORA) sumar envío
      const shipping = await tx.shippingMethod.findUnique({
        where: { id: shippingMethodId },
        select: { price: true }
      })

      if (!shipping)
        throw Object.assign(new Error('Método de envío no válido.'), { statusCode: 400 })

      total += shipping.price

      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingMethodId,
          shippingAddress,
          paymentMethod,
          total,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: { items: true }
      })

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    return reply.code(201).send(order)
  })
  
}

module.exports = routes;
```

## Users

Consulta de todos los usuarios (get)
/users
```bash
curl http://localhost:4000/users
```
/users/:id
Consulta de un usuario
```bash
curl http://localhost:4000/users/1
```
/users
Creacion de un usuario
```bash
curl -X POST http://localhost:4000/users -H "Content-Type: application/json" -d '{"name":"Ana López","email":"ana@ejemplo.com","password":"segura1234","role":"user"}'
```
/users/:id
Actualizacion de campos de un usuario
```bash
curl -X PUT http://localhost:4000/users/1 -H "Content-Type: application/json" -d '{"name":"Ana Ruiz","email":"ana.nueva@ejemplo.com","role":"admin"}'
```
/users/:id/password
Actualizacion de contrasena (probar si funciona, contra hasheada)
```bash
curl -X PUT http://localhost:4000/users/1/password -H "Content-Type: application/json" -d '{"password":"nuevaSegura99"}'
```
/users/:id
Eliminar un usuario 
```bash
curl -X DELETE http://localhost:4000/users/1
```
## Category 

/Categories
Obtener todas las categorias
```bash
curl http://localhost:4000/categories
```
/categories/:id/
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
## Products
Consultar todos los productos

```bash
curl http://localhost:4000/products
```

```










## Para barra de busqueda
```bash
curl "http://localhost:4000/products/search?q=celular"
```
"celular" seria cualquier nombre de producto / categoria