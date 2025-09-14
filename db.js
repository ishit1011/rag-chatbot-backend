const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

const connectDB = async(req,res)=>{
    try {
        await prisma.$connect();
        console.log('Connected to SQL DB !');

    } catch (error) {
        console.log('Error connecting Prisma DB : ',error);
    }
}


module.exports = {connectDB, prisma};
