const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const {connectDB, prisma} = require('./db');
const {checkRedisConnection} = require('./services/redis');
const {checkSessionIDRedis} = require('./services/sessionIdRedis')
const userRoutes = require('./routes/UserRoutes');
const sessionRoutes = require('./routes/SessionRoutes');
const botRoutes = require('./routes/BotRoutes');

dotenv.config();
connectDB();
checkRedisConnection(); // remove in production 
checkSessionIDRedis();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/user',userRoutes);
app.use('/session',sessionRoutes);
app.use('/bot',botRoutes);


app.listen(PORT, (()=>{
    console.log('Server running on port ',PORT);
}))