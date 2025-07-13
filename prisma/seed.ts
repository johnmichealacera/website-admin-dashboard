import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting multi-tenant seed...')

  // Clean existing data in correct order (due to foreign key constraints)
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.about.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.event.deleteMany()
  await prisma.userSite.deleteMany()
  await prisma.user.deleteMany()
  await prisma.site.deleteMany()

  // Create Sites with different packages
  const site1 = await prisma.site.create({
    data: {
      name: 'Thrifty Shoes Store',
      domain: 'thriftyshoes.com',
      subdomain: 'thriftyshoes',
      description: 'Premium second-hand footwear marketplace',
      isActive: true,
      packageType: 'BASIC',
      features: ['DASHBOARD', 'PRODUCTS', 'CATEGORIES']
    },
  })

  const site2 = await prisma.site.create({
    data: {
      name: 'Green Fashion Hub',
      domain: 'greenfashion.com',
      subdomain: 'greenfashion',
      description: 'Sustainable fashion and accessories store',
      isActive: true,
      packageType: 'PREMIUM',
      features: ['DASHBOARD', 'PRODUCTS', 'CATEGORIES', 'EVENTS', 'EVENT_SERVICES', 'ABOUT']
    },
  })

  const site3 = await prisma.site.create({
    data: {
      name: 'Tech Gadgets Exchange',
      domain: 'techexchange.com',
      subdomain: 'techexchange',
      description: 'Refurbished electronics and tech accessories',
      isActive: true,
      packageType: 'ENTERPRISE',
      features: ['DASHBOARD', 'PRODUCTS', 'CATEGORIES', 'EVENTS', 'EVENT_SERVICES', 'ABOUT', 'CONTACT']
    },
  })

  console.log('🏢 Created sites:', [site1.name, site2.name, site3.name])
  console.log('📦 Package types:', [
    `${site1.name}: ${site1.packageType}`,
    `${site2.name}: ${site2.packageType}`,
    `${site3.name}: ${site3.packageType}`
  ])

  // Create Demo Users
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@thriftyshoes.com',
      auth0UserId: 'auth0|demo-user-1',
      name: 'John Smith',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'manager@greenfashion.com',
      auth0UserId: 'auth0|demo-user-2',
      name: 'Sarah Johnson',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      auth0UserId: 'auth0|demo-super-admin',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })

  console.log('👥 Created users:', [user1.email, user2.email, superAdmin.email])

  // Create User-Site relationships
  await prisma.userSite.createMany({
    data: [
      // User1 has access to site1 (Basic package)
      { userId: user1.id, siteId: site1.id, role: 'ADMIN' },
      // User2 has access to site2 (Premium package)
      { userId: user2.id, siteId: site2.id, role: 'ADMIN' },
      // Super admin has access to all sites
      { userId: superAdmin.id, siteId: site1.id, role: 'ADMIN' },
      { userId: superAdmin.id, siteId: site2.id, role: 'ADMIN' },
      { userId: superAdmin.id, siteId: site3.id, role: 'ADMIN' },
    ],
  })

  console.log('🔗 Created user-site relationships')

  // Create Categories for Site 1 (Thrifty Shoes - Basic Package)
  const site1Categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Sneakers',
        description: 'Athletic and casual sneakers in great condition',
        siteId: site1.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Dress Shoes',
        description: 'Formal footwear for professional occasions',
        siteId: site1.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Boots',
        description: 'Work boots, hiking boots, and fashion boots',
        siteId: site1.id,
      },
    }),
  ])

  // Create Categories for Site 2 (Green Fashion - Premium Package)
  const site2Categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Eco-Friendly Clothing',
        description: 'Sustainable and organic clothing options',
        siteId: site2.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Recycled Accessories',
        description: 'Accessories made from recycled materials',
        siteId: site2.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Vintage Fashion',
        description: 'Curated vintage clothing and accessories',
        siteId: site2.id,
      },
    }),
  ])

  // Create Categories for Site 3 (Tech Gadgets - Enterprise Package)
  const site3Categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Smartphones',
        description: 'Refurbished smartphones and accessories',
        siteId: site3.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Laptops',
        description: 'Refurbished laptops and computers',
        siteId: site3.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gaming',
        description: 'Gaming consoles and accessories',
        siteId: site3.id,
      },
    }),
  ])

  console.log('📂 Created categories for all sites')

  // Create Products for Site 1 (Basic Package - Products only)
  const site1Products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Nike Air Max 90',
        description: 'Classic Nike sneakers in excellent condition',
        price: 89.99,
        stock: 5,
        imageUrls: ['https://via.placeholder.com/300x300?text=Nike+Air+Max'],
        isActive: true,
        categoryId: site1Categories[0].id,
        siteId: site1.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Leather Oxford Shoes',
        description: 'Professional leather dress shoes',
        price: 129.99,
        stock: 3,
        imageUrls: ['https://via.placeholder.com/300x300?text=Oxford+Shoes'],
        isActive: true,
        categoryId: site1Categories[1].id,
        siteId: site1.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Timberland Work Boots',
        description: 'Durable work boots for tough conditions',
        price: 159.99,
        stock: 2,
        imageUrls: ['https://via.placeholder.com/300x300?text=Work+Boots'],
        isActive: true,
        categoryId: site1Categories[2].id,
        siteId: site1.id,
      },
    }),
  ])

  // Create Products for Site 2 (Premium Package - Products + Events + About)
  const site2Products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Organic Cotton T-Shirt',
        description: 'Sustainable organic cotton t-shirt',
        price: 35.99,
        stock: 15,
        imageUrls: ['https://via.placeholder.com/300x300?text=Organic+Tshirt'],
        isActive: true,
        categoryId: site2Categories[0].id,
        siteId: site2.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Recycled Plastic Backpack',
        description: 'Backpack made from recycled ocean plastic',
        price: 79.99,
        stock: 8,
        imageUrls: ['https://via.placeholder.com/300x300?text=Eco+Backpack'],
        isActive: true,
        categoryId: site2Categories[1].id,
        siteId: site2.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Vintage Leather Jacket',
        description: 'Authentic vintage leather jacket from the 80s',
        price: 199.99,
        stock: 1,
        imageUrls: ['https://via.placeholder.com/300x300?text=Vintage+Jacket'],
        isActive: true,
        categoryId: site2Categories[2].id,
        siteId: site2.id,
      },
    }),
  ])

  // Create Products for Site 3 (Enterprise Package - All features)
  const site3Products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 13 Pro Refurbished',
        description: 'Professionally refurbished iPhone 13 Pro',
        price: 699.99,
        stock: 10,
        imageUrls: ['https://via.placeholder.com/300x300?text=iPhone+13'],
        isActive: true,
        categoryId: site3Categories[0].id,
        siteId: site3.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Pro 2021',
        description: 'Refurbished MacBook Pro with M1 chip',
        price: 1299.99,
        stock: 3,
        imageUrls: ['https://via.placeholder.com/300x300?text=MacBook+Pro'],
        isActive: true,
        categoryId: site3Categories[1].id,
        siteId: site3.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'PlayStation 5',
        description: 'Refurbished PlayStation 5 console',
        price: 449.99,
        stock: 2,
        imageUrls: ['https://via.placeholder.com/300x300?text=PlayStation+5'],
        isActive: true,
        categoryId: site3Categories[2].id,
        siteId: site3.id,
      },
    }),
  ])

  console.log('📦 Created products for all sites')

  // Create Events for Site 2 (Premium Package)
  await prisma.event.create({
    data: {
      title: 'Sustainable Fashion Workshop',
      description: 'Learn about sustainable fashion practices and eco-friendly materials',
      startDate: new Date('2024-03-15T14:00:00Z'),
      endDate: new Date('2024-03-15T17:00:00Z'),
      location: 'Green Fashion Hub Store',
      address: '123 Eco Street',
      city: 'Green City',
      province: 'Eco Province',
      zipCode: '12345',
      country: 'Eco Country',
      price: 25.00,
      maxAttendees: 20,
      isActive: true,
      isFeatured: true,
      tags: ['sustainability', 'fashion', 'workshop'],
      contactEmail: 'events@greenfashion.com',
      contactPhone: '+1234567890',
      siteId: site2.id,
    },
  })

  // Create Events for Site 3 (Enterprise Package)
  await prisma.event.create({
    data: {
      title: 'Tech Gadgets Expo',
      description: 'Showcase of the latest refurbished tech gadgets and electronics',
      startDate: new Date('2024-04-20T10:00:00Z'),
      endDate: new Date('2024-04-20T18:00:00Z'),
      location: 'Tech Exchange Center',
      address: '456 Tech Avenue',
      city: 'Silicon Valley',
      province: 'California',
      zipCode: '94000',
      country: 'USA',
      price: 0,
      maxAttendees: 100,
      isActive: true,
      isFeatured: true,
      tags: ['technology', 'gadgets', 'expo'],
      contactEmail: 'events@techexchange.com',
      contactPhone: '+1987654321',
      siteId: site3.id,
    },
  })

  console.log('🎉 Created events for premium and enterprise sites')

  // Create About information for Site 2 (Premium Package)
  await prisma.about.create({
    data: {
      title: 'About Green Fashion Hub',
      content: 'We are committed to promoting sustainable fashion and reducing environmental impact through carefully curated eco-friendly clothing and accessories.',
      mission: 'To make sustainable fashion accessible and affordable for everyone.',
      vision: 'A world where fashion is both stylish and environmentally responsible.',
      values: ['Sustainability', 'Quality', 'Transparency', 'Community'],
      siteId: site2.id,
    },
  })

  // Create About information for Site 3 (Enterprise Package)
  await prisma.about.create({
    data: {
      title: 'About Tech Gadgets Exchange',
      content: 'We specialize in professionally refurbished electronics and tech gadgets, giving quality devices a second life while making technology more accessible.',
      mission: 'To reduce electronic waste while providing high-quality refurbished technology.',
      vision: 'A sustainable future where technology is accessible, affordable, and environmentally responsible.',
      values: ['Quality', 'Sustainability', 'Innovation', 'Customer Service'],
      siteId: site3.id,
    },
  })

  console.log('📝 Created about information for premium and enterprise sites')

  // Create Contact information for Site 3 (Enterprise Package only)
  await prisma.contact.create({
    data: {
      businessName: 'Tech Gadgets Exchange',
      email: 'info@techexchange.com',
      phone: '+1-555-TECH-123',
      address: '456 Tech Avenue',
      city: 'Silicon Valley',
      province: 'California',
      zipCode: '94000',
      country: 'USA',
      socialLinks: {
        website: 'https://techexchange.com',
        twitter: 'https://twitter.com/techexchange',
        facebook: 'https://facebook.com/techexchange',
        instagram: 'https://instagram.com/techexchange',
        linkedin: 'https://linkedin.com/company/techexchange'
      },
      siteId: site3.id,
    },
  })

  console.log('📞 Created contact information for enterprise site')

  // Create Event Services for Premium and Enterprise sites
  const eventServices = await Promise.all([
    // Premium site event services
    prisma.eventService.create({
      data: {
        name: 'Classic Wedding Package',
        description: 'The Classic Wedding Package includes professional hair and makeup styling for the bride and groom on the wedding day, plus beautiful finishing touches and accessories to complete the look.',
        basePrice: 15000,
        category: 'Wedding',
        duration: 'Full Day',
        inclusions: [
          'HD Makeup for Bride and Groom',
          'Commercial Hairstyling',
          '3 Different Looks: Preparation, Ceremony, and Reception',
          'Retouch Throughout the Event',
          'Beauty Assistant'
        ],
        addOns: [
          { name: 'Hair Extensions & Contact Lenses', price: 1000, description: 'Premium hair extensions and colored contact lenses' },
          { name: 'Extra Head (Hair & Makeup)', price: 2000, description: 'Additional person for hair and makeup services' }
        ],
        freebies: [
          'Accessories (Earrings and Hair Accessories)'
        ],
        tags: ['wedding', 'bridal', 'makeup', 'hair'],
        isActive: true,
        isFeatured: true,
        contactEmail: 'wedding@greenfashion.com',
        contactPhone: '+63 9XX XXX XXXX',
        siteId: site2.id,
      },
    }),
    prisma.eventService.create({
      data: {
        name: 'Premium Wedding Package',
        description: 'The Premium Wedding Package covers everything from your prenup to your wedding day, with complete HD makeup, styling, and full beauty assistance for a flawless, worry-free experience.',
        basePrice: 25000,
        category: 'Wedding',
        duration: 'Prenup + Wedding Day',
        inclusions: [
          'HD Makeup for Bride and Groom',
          'Commercial Hairstyling',
          '3 Layouts',
          'Unlimited Retouch',
          'Beauty Assistant',
          'Contact Lenses and Hair Extensions',
          '2 Heads Traditional Hair and Makeup'
        ],
        addOns: [
          { name: 'Additional Prenup Look', price: 3000, description: 'Extra styling for prenup shoot' },
          { name: 'Bridal Party Makeup', price: 1500, description: 'Per person makeup for bridal party' }
        ],
        freebies: [
          'Accessories (Earrings and Hair Accessories)',
          'Touch-up Kit',
          'Bridal Robe'
        ],
        tags: ['wedding', 'prenup', 'premium', 'bridal'],
        isActive: true,
        isFeatured: true,
        contactEmail: 'premium@greenfashion.com',
        contactPhone: '+63 9XX XXX XXXX',
        siteId: site2.id,
      },
    }),
    // Enterprise site event services
    prisma.eventService.create({
      data: {
        name: 'Corporate Event Photography',
        description: 'Professional photography services for corporate events, conferences, and business gatherings with high-quality equipment and experienced photographers.',
        basePrice: 20000,
        category: 'Corporate',
        duration: '8 Hours',
        inclusions: [
          'Professional Photographer',
          'High-Resolution Digital Photos',
          'Event Coverage Documentation',
          'Basic Photo Editing',
          'Online Gallery Access'
        ],
        addOns: [
          { name: 'Second Photographer', price: 8000, description: 'Additional photographer for comprehensive coverage' },
          { name: 'Same Day Editing', price: 5000, description: 'Quick turnaround edited photos' },
          { name: 'Printed Photo Album', price: 3000, description: 'Professional photo album' }
        ],
        freebies: [
          'USB Drive with All Photos',
          'Basic Slideshow'
        ],
        tags: ['corporate', 'photography', 'business', 'events'],
        isActive: true,
        isFeatured: true,
        contactEmail: 'corporate@techexchange.com',
        contactPhone: '+63 9XX XXX XXXX',
        bookingUrl: 'https://techexchange.com/book-photography',
        siteId: site3.id,
      },
    }),
    prisma.eventService.create({
      data: {
        name: 'Tech Conference Setup',
        description: 'Complete technical setup and support for conferences, including audio-visual equipment, live streaming, and technical assistance throughout the event.',
        basePrice: 35000,
        category: 'Corporate',
        duration: 'Full Day Setup + Event',
        inclusions: [
          'Audio-Visual Equipment Setup',
          'Live Streaming Setup',
          'Technical Support Staff',
          'Microphone and Speaker Systems',
          'Projection and Display Setup',
          'Recording Equipment'
        ],
        addOns: [
          { name: 'Multi-Camera Live Stream', price: 15000, description: 'Professional multi-angle live streaming' },
          { name: 'Interactive Presentation Tools', price: 8000, description: 'Advanced presentation technology' },
          { name: 'Post-Event Video Editing', price: 10000, description: 'Professional video editing services' }
        ],
        freebies: [
          'Basic Technical Rehearsal',
          'Equipment Backup',
          'Technical Documentation'
        ],
        tags: ['tech', 'conference', 'audio-visual', 'streaming'],
        isActive: true,
        isFeatured: false,
        contactEmail: 'tech@techexchange.com',
        contactPhone: '+63 9XX XXX XXXX',
        bookingUrl: 'https://techexchange.com/book-tech-setup',
        siteId: site3.id,
      },
    })
  ])

  console.log('✨ Created event services for premium and enterprise sites')

  console.log('✅ Multi-tenant seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- ${site1.name}: ${site1.packageType} (${site1.features.join(', ')})`)
  console.log(`- ${site2.name}: ${site2.packageType} (${site2.features.join(', ')})`)
  console.log(`- ${site3.name}: ${site3.packageType} (${site3.features.join(', ')})`)
  console.log('\n🔑 Test Users:')
  console.log(`- ${user1.email} (${user1.role}) - Access to ${site1.name}`)
  console.log(`- ${user2.email} (${user2.role}) - Access to ${site2.name}`)
  console.log(`- ${superAdmin.email} (${superAdmin.role}) - Access to all sites`)
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 