import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const week4Activities = await prisma.activity.findMany({
    where: { weekNumber: 4 },
    select: { slug: true, title: true, activityType: true },
    orderBy: { activityType: 'asc' }
  })

  console.log('\n📋 Week 4 Activities:\n')
  week4Activities.forEach(a => {
    console.log(`  ${a.activityType.toUpperCase()}: ${a.title}`)
    console.log(`    slug: ${a.slug}\n`)
  })

  await prisma.$disconnect()
}

check().catch(console.error)
