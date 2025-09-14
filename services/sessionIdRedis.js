const { Redis } =  require('@upstash/redis');

const redis_sessionID = new Redis({
  url: process.env.SESSION_ID_REDIS_URL, 
  token: process.env.SESSION_ID_REDIS_TOKEN,
});

async function checkSessionIDRedis() {
  try {
    // Attempt a simple operation like setting a test key.
    // The `ping()` method is also a great option.
    await redis_sessionID.set('connection-test', 'ok', { ex: 5 }); 

    // If the operation succeeds, log a success message.
    console.log('✅ Session ID - Redis is up and running!');

    // Clean up the test key
    await redis_sessionID.del('connection-test');
  } catch (error) {
    // If there's an error, log a failure message and the error details.
    console.error('❌ Session ID - Redis connection failed:', error);
  }
}

module.exports = {redis_sessionID, checkSessionIDRedis}