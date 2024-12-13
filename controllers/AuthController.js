import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * Handles user authentication using Basic Auth.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers.authorization - The authorization header containing the Basic Auth
 * credentials.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - Returns a JSON response with a token if authentication is
 * successful, otherwise returns an error message.
 */
const getConnect = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) return res.status(401).json({ error: 'Unauthorized' });

  const base64Credentials = authHeader.split(' ')[1];
  if (!base64Credentials) return res.status(401).json({ error: 'Unauthorized' });
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'ascii',
  );
  const [email, password] = credentials.split(':');

  if (!email || !password) return res.status(401).json({ error: 'Unauthorized' });
  const sha1Password = crypto
    .createHash('sha1')
    .update(password)
    .digest('hex');
  const user = await dbClient.db
    .collection('users')
    .findOne({ email, password: sha1Password });

  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const token = uuidv4();
  const key = `auth_${token}`;
  await redisClient.set(key, user._id.toString(), 24 * 60 * 60);

  return res.status(200).json({ token });
};

/**
 * Handles user disconnection.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers["x-token"] - The token to disconnect.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - Returns a 204 status code if disconnection is successful, otherwise
 * returns an error message.
 */
const getDisconnect = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  await redisClient.del(`auth_${token}`);
  return res.status(204).end();
};

/**
 * Retrieves the user information.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers["x-token"] - The token to retrieve the user information.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - Returns a JSON response with the user information if successful,
 * otherwise returns an error message.
 */
const getMe = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await dbClient.db
    .collection('users')
    .findOne({ _id: ObjectId(userId) });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  return res.status(200).json({ id: user._id, email: user.email });
};
export default { getConnect, getDisconnect, getMe };
