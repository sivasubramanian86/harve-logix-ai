import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.farmer.count()
  console.log(`Total Farmers: ${count}`)
  
  if (count === 0) {
    console.log('Database is empty. Adding a mock farmer to trigger real dashboard logic...')
    await prisma.farmer.create({
      data: {
        id: 'real-farmer-001',
        name: 'Siva Subramanian',
        location: 'Mumbai, Maharashtra',
        crops: { set: ['Rice', 'Wheat'] },
        status: 'active',
        region: 'South',
        lastDecisionDate: new Date()
      }
    })
    console.log('Mock farmer created!')
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
