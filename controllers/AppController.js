import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * Controller function to get the status of the application.
 * Responds with the status of the Redis and database clients.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
const getStatus = (req, res) => {
  res.status(200).send({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
};
/**
 * Asynchronously retrieves and sends the number of users and files.
 *
 * @async
 * @function getStats
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the number of users and files.
 */
const getStats = async (req, res) => {
  res.status(200).send({
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  });
};
export default { getStatus, getStats };
