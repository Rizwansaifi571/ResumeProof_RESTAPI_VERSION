"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables.');
        process.exit(1);
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    await prisma.admin.upsert({
        where: { email },
        update: {
            passwordHash,
        },
        create: {
            email,
            passwordHash,
            name: 'System Admin',
            role: 'admin',
            isActive: true,
        },
    });
    console.log(`Admin seeded: ${email}`);
}
seedAdmin()
    .catch((error) => {
    console.error('Error seeding admin:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
