const { Redis } =  require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,   // store in .env
  token: process.env.UPSTASH_REDIS_TOKEN,
});

async function checkRedisConnection() {
  try {
    // Attempt a simple operation like setting a test key.
    // The `ping()` method is also a great option.
    await redis.set('connection-test', 'ok', { ex: 5 }); 

    // If the operation succeeds, log a success message.
    console.log('✅ Redis is up and running!');

    // Clean up the test key
    await redis.del('connection-test');
  } catch (error) {
    // If there's an error, log a failure message and the error details.
    console.error('❌ Redis connection failed:', error);
  }
}

module.exports = {redis, checkRedisConnection}

// await redis.set("foo", "bar");
// await redis.get("foo");