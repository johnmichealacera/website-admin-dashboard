import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.about.deleteMany()
  await prisma.contact.deleteMany()

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Shoes',
        description: 'Pre-owned sneakers, boots, and dress shoes in great condition',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Jackets',
        description: 'Vintage and contemporary outerwear for all seasons',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tennis Rackets',
        description: 'Quality used tennis equipment for players of all levels',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Apparel',
        description: 'Trendy clothing and accessories at affordable prices',
      },
    }),
  ])

  console.log('📦 Created categories:', categories.map(c => c.name))

  // Create Products
  const products = await Promise.all([
    // Shoes
    prisma.product.create({
      data: {
        name: 'Nike Air Max 90',
        description: 'Classic white and red colorway, gently used, size 10',
        price: 85.99,
        stock: 3,
        imageUrls: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        ],
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Adidas Stan Smith',
        description: 'Timeless white leather sneakers, excellent condition, size 9',
        price: 45.00,
        stock: 2,
        imageUrls: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400'],
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Vintage Converse Chuck Taylor',
        description: 'Black high-top classics, shows character, size 8.5',
        price: 35.00,
        stock: 1,
        imageUrls: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400'],
        categoryId: categories[0].id,
      },
    }),

    // Jackets
    prisma.product.create({
      data: {
        name: 'Levi\'s Denim Jacket',
        description: 'Classic blue denim jacket, vintage wash, size Medium',
        price: 55.00,
        stock: 4,
        imageUrls: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'North Face Fleece',
        description: 'Cozy navy fleece jacket, perfect for outdoor activities, size Large',
        price: 40.00,
        stock: 2,
        imageUrls: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'],
        categoryId: categories[1].id,
      },
    }),

    // Tennis Rackets
    prisma.product.create({
      data: {
        name: 'Wilson Pro Staff',
        description: 'Professional tennis racket, great for intermediate players, recently restrung',
        price: 120.00,
        stock: 1,
        imageUrls: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'],
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Babolat Pure Drive',
        description: 'Excellent power racket, ideal for aggressive players, good condition',
        price: 95.00,
        stock: 2,
        imageUrls: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'],
        categoryId: categories[2].id,
      },
    }),

    // Apparel
    prisma.product.create({
      data: {
        name: 'Vintage Band T-Shirt',
        description: 'Authentic 90s rock band tee, soft cotton, size Large',
        price: 25.00,
        stock: 3,
        imageUrls: ['https://images.unsplash.com/photo-1583743089649-6556f4b60b0b?w=400'],
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Designer Sunglasses',
        description: 'Ray-Ban Wayfarer style, no scratches, includes case',
        price: 65.00,
        stock: 1,
        imageUrls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'],
        categoryId: categories[3].id,
      },
    }),
  ])

  console.log('👟 Created products:', products.length)

  // Create About Us content
  const about = await prisma.about.create({
    data: {
      title: 'About Thrifted Shoes Apparel',
      content: 'Welcome to Thrifted Shoes Apparel, your premier destination for high-quality pre-owned fashion and sports equipment. We believe that great style shouldn\'t break the bank, and that giving items a second life is both economically smart and environmentally responsible.',
      mission: 'To provide affordable, quality pre-owned items while promoting sustainable consumption and helping our community look and feel great.',
      vision: 'To become the go-to destination for conscious consumers who value quality, affordability, and sustainability.',
      values: [
        'Sustainability - Every item we sell gets a second chance',
        'Quality - We carefully inspect all items before listing',
        'Community - Supporting local thrift culture and conscious shopping',
        'Affordability - Great style accessible to everyone',
      ],
    },
  })

  console.log('📝 Created about content', about.title)

  // Create Contact information
  const contact = await prisma.contact.create({
    data: {
      businessName: 'Thrifted Shoes Apparel',
      email: 'hello@thriftedshoes.com',
      phone: '(555) 123-4567',
      address: '123 Thrift Street',
      city: 'Portland',
      state: 'Oregon',
      zipCode: '97201',
      country: 'United States',
      socialLinks: {
        instagram: 'https://instagram.com/thriftedshoes',
        facebook: 'https://facebook.com/thriftedshoes',
        twitter: 'https://twitter.com/thriftedshoes',
      },
    },
  })

  console.log('📞 Created contact information', contact.businessName)

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 