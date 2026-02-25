const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Ver todos los usuarios
  const profiles = await prisma.profile.findMany()
  console.log('Perfiles encontrados:', profiles)
  
  // Buscar admin específico
  const admin = await prisma.profile.findUnique({
    where: { dni: '43023002' }
  })
  console.log('Admin:', admin)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
