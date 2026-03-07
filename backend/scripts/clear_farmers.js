import 'dotenv/config'
import pkg from '@prisma/client'
const { PrismaClient } = pkg
const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing farmers...')
  await prisma.farmer.deleteMany({})
  console.log('Cleared.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
