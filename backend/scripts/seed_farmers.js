import 'dotenv/config'
import pkg from '@prisma/client'
const { PrismaClient } = pkg
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding farmers into PostgreSQL database...')

  const defaultFarmers = [
    {
      name: 'Rajesh Kumar',
      location: 'Pune',
      crops: ['Cotton', 'Sugarcane'],
      status: 'active',
      region: 'West',
    },
    {
      name: 'Priya Singh',
      location: 'Patiala',
      crops: ['Wheat', 'Rice'],
      status: 'active',
      region: 'North',
    },
    {
      name: 'Arjun Patel',
      location: 'Surat',
      crops: ['Groundnut', 'Sesame'],
      status: 'active',
      region: 'West',
    },
    {
      name: 'Meena Reddy',
      location: 'Hyderabad',
      crops: ['Cotton', 'Maize'],
      status: 'inactive',
      region: 'South',
    },
    {
      name: 'Vikram Sharma',
      location: 'Jaipur',
      crops: ['Mustard', 'Pearl Millet'],
      status: 'active',
      region: 'North',
    }
  ]

  for (const f of defaultFarmers) {
    await prisma.farmer.create({
      data: f,
    })
  }

  const count = await prisma.farmer.count()
  console.log(`Successfully seeded! Database now contains \${count} farmers.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
