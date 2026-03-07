import 'dotenv/config'
import pkg from '@prisma/client'
const { PrismaClient } = pkg
const prisma = new PrismaClient()

async function main() {
  console.log('Bulk Seeding 500 realistic farmers into PostgreSQL database...')

  const regions = ['North', 'South', 'East', 'West', 'Central']
  const locations = ['Punjab', 'Haryana', 'Maharashtra', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Andhra Pradesh', 'Madhya Pradesh', 'Telangana']
  const cropTypes = ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Soybean', 'Groundnut', 'Mustard', 'Pearl Millet']

  const generateRandomFarmer = (index) => {
    const region = regions[Math.floor(Math.random() * regions.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    // Pick 1-3 random crops
    const numCrops = Math.floor(Math.random() * 3) + 1
    const crops = []
    for (let c = 0; c < numCrops; c++) {
      const crop = cropTypes[Math.floor(Math.random() * cropTypes.length)]
      if (!crops.includes(crop)) crops.push(crop)
    }
    if (crops.length === 0) crops.push('Wheat') // fallback

    return {
      name: `Farmer Profile ${index + 100}`,
      location,
      crops,
      status: Math.random() > 0.15 ? 'active' : 'inactive', // 85% active
      region,
      lastDecisionDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
    }
  }

  const farmersBlock = []
  for (let i = 0; i < 500; i++) {
    farmersBlock.push(generateRandomFarmer(i))
  }

  // Insert in chunks of 100 to avoid limits
  let inserted = 0
  for (let i = 0; i < farmersBlock.length; i += 100) {
    const chunk = farmersBlock.slice(i, i + 100)
    await prisma.farmer.createMany({
      data: chunk,
      skipDuplicates: true
    })
    inserted += chunk.length
    console.log(`Inserted ${inserted} so far...`)
  }

  const totalCount = await prisma.farmer.count()
  console.log(`Successfully completed bulk seed! Database now contains ${totalCount} total farmers.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
