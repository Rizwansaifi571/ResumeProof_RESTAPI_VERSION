const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const client = await prisma.client.create({
    data: {
      email: 'demo5@krmu.edu',
      passwordHash: 'dummy',
      name: 'Demo Admin',
      isVerified: true
    }
  });

  const rawKey = 'rp_' + crypto.randomBytes(32).toString('hex');
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

  const apiKey = await prisma.apiKey.create({
    data: {
      clientId: client.id,
      label: 'Demo API Key',
      keyHash: hashedKey,
      prefix: rawKey.substring(0, 8)
    }
  });

  console.log('CLIENT_ID=' + client.id);
  console.log('RESUMEPROOF_API_KEY=' + rawKey);
}

main().catch(console.error).finally(() => prisma.$disconnect());
