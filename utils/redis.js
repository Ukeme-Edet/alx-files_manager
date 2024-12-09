import { createClient } from 'redis';

/**
 * RedisClient class to interact with a Redis database.
 */
class RedisClient {
  /**
     * Creates an instance of RedisClient.
     */
  constructor() {
    this.client = createClient();
  }

  /**
     * Checks if the Redis client is connected.
     * @returns {boolean} True if the client is connected, otherwise false.
     */
  isAlive() {
    return this.client.connected;
  }

  /**
     * Retrieves the value associated with the given key from Redis.
     * @param {string} key - The key to retrieve.
     * @returns {Promise<string>} A promise that resolves to the value associated with the key.
     */
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  /**
     * Sets a value in Redis with an expiration time.
     * @param {string} key - The key to set.
     * @param {string} value - The value to set.
     * @param {number} duration - The expiration time in seconds.
     * @returns {Promise<void>} A promise that resolves when the value is set.
     */
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  /**
     * Deletes a key from Redis.
     * @param {string} key - The key to delete.
     * @returns {Promise<void>} A promise that resolves when the key is deleted.
     */
  async del(key) {
    this.client.del(key);
  }
}
const redisClient = new RedisClient();
export default redisClient;
