import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting multi-tenant seed for MD Events & Services...')

  // Clean existing data
  await prisma.eventService.deleteMany()
  await prisma.event.deleteMany()
  await prisma.category.deleteMany()
  await prisma.about.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.userSite.deleteMany()
  await prisma.user.deleteMany()
  await prisma.site.deleteMany()

  // Create MD Events & Services site
  const mdSite = await prisma.site.create({
    data: {
      name: 'MD Events & Services',
      domain: 'mdevents.com',
      subdomain: 'mdevents',
      description: 'Professional event planning and styling services for weddings, birthdays, and corporate functions.',
      isActive: true,
      packageType: 'PREMIUM',
      features: {
        create: [
          { name: "DASHBOARD", description: "Dashboard feature" },
          { name: "EVENTS", description: "Events feature" },
          { name: "EVENT_SERVICES", description: "Event services feature" },
          { name: "ABOUT", description: "About feature" },
          { name: "CONTACT", description: "Contact feature" }
        ]
      },
    },
  })

  console.log('🏢 Created site:', mdSite.name)

  // Create admin user for MD Events & Services
  const markUser = await prisma.user.create({
    data: {
      email: 'mark@mdevents.com',
      auth0UserId: 'auth0|mark-md',
      name: 'Mark Gil',
      role: 'ADMIN',
      isActive: true,
    },
  })

  await prisma.userSite.create({
    data: {
      userId: markUser.id,
      siteId: mdSite.id,
      role: 'ADMIN',
    },
  })

  console.log('👤 Created admin user:', markUser.email)

  // Add About Page content
  await prisma.about.create({
    data: {
      title: 'About MD Events & Services',
      content: 'MD Events & Services specializes in creating unforgettable moments through professional event planning, styling, and coordination.',
      mission: 'To turn your special day into a beautiful and stress-free celebration.',
      vision: 'To be the trusted partner for all memorable events in our region.',
      values: ['Creativity', 'Reliability', 'Passion', 'Client Care'],
      siteId: mdSite.id,
    },
  })

  console.log('📝 Created About content')

  // Add Contact Page content
  await prisma.contact.create({
    data: {
      businessName: 'MD Events & Services',
      email: 'hello@mdevents.com',
      phone: '+63 9XX XXX XXXX',
      address: '123 Celebration St.',
      city: 'Socorro',
      province: 'Surigao del Norte',
      zipCode: '8416',
      country: 'Philippines',
      socialLinks: {
        facebook: 'https://facebook.com/mdevents',
        instagram: 'https://instagram.com/mdevents',
      },
      siteId: mdSite.id,
    },
  })

  console.log('📞 Created Contact information')

  // Add Event Services (realistic)
  await Promise.all([
    prisma.eventService.create({
      data: {
        name: 'Full Wedding Coordination',
        description: 'From concept to execution, complete wedding planning and coordination.',
        basePrice: 45000,
        packages: ['Silver', 'Gold', 'Platinum'],
        duration: 'Full Day',
        inclusions: [
          'Venue Setup',
          'Styling & Decor',
          'On-day Coordination',
          'Supplier Management',
          'Program Flow Assistance',
        ],
        addOns: [
          { name: 'Photo & Video Coverage', price: 15000, description: 'Professional wedding photography and video.' },
          { name: 'Bridal Car', price: 5000, description: 'Classic bridal car with driver.' },
        ],
        freebies: ['Free Cake Topper', 'Souvenir Table Decor'],
        tags: ['wedding', 'coordination', 'full service'],
        isActive: true,
        isFeatured: true,
        contactEmail: 'weddings@mdevents.com',
        contactPhone: '+63 9XX XXX XXXX',
        siteId: mdSite.id,
      },
    }),
    prisma.eventService.create({
      data: {
        name: 'Birthday Styling Package',
        description: 'Themed decorations and styling for birthday parties.',
        basePrice: 15000,
        packages: ['Silver', 'Gold', 'Platinum'],
        duration: 'Half Day',
        inclusions: [
          'Themed Backdrop & Stage',
          'Balloon Decorations',
          'Centerpieces',
          'Photo Wall',
        ],
        addOns: [
          { name: 'Host/Emcee', price: 3000, description: 'Professional party host.' },
          { name: 'Candy Buffet', price: 2500, description: 'Sweet treats table for kids.' },
        ],
        freebies: ['Party Hat & Giveaways'],
        tags: ['birthday', 'styling', 'kids party'],
        isActive: true,
        isFeatured: false,
        contactEmail: 'birthdays@mdevents.com',
        contactPhone: '+63 9XX XXX XXXX',
        siteId: mdSite.id,
      },
    }),
    prisma.eventService.create({
      data: {
        name: 'Corporate Event Setup',
        description: 'Professional setup and styling for business launches, conferences, and seminars.',
        basePrice: 25000,
        packages: ['Deluxe', 'All-in Signature'],
        duration: 'One Day',
        inclusions: [
          'Stage & Backdrop Design',
          'Audio-Visual Setup',
          'Table Centerpieces',
          'Registration Booth Styling',
        ],
        addOns: [
          { name: 'Live Streaming', price: 10000, description: 'Full event live streaming.' },
          { name: 'Photo Wall', price: 3000, description: 'Branded photo wall for guests.' },
        ],
        freebies: ['Event Signage'],
        tags: ['corporate', 'launch', 'seminar'],
        isActive: true,
        isFeatured: true,
        contactEmail: 'corporate@mdevents.com',
        contactPhone: '+63 9XX XXX XXXX',
        siteId: mdSite.id,
      },
    }),
  ])

  console.log('✨ Created Event Services for MD Events & Services')

  console.log('✅ Multi-tenant seed for MD Events & Services completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
