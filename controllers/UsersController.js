import dbClient from '../utils/db';

/**
 * Creates a new user in the database.
 *
 * @async
 * @function postNew
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {Error} - Throws an error if email or password is missing, or if the user already exists.
 */
const postNew = async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).send({ error: 'Missing email' });
  if (!password) return res.status(400).send({ error: 'Missing password' });
  const user = await dbClient.db.collection('users').findOne({ email });
  if (user) return res.status(400).send({ error: 'Already exist' });
  await dbClient.db.collection('users').insertOne({ email, password });
  const userCreated = await dbClient.db.collection('users').findOne({ email });
  return res.status(201).send({ id: userCreated._id, email });
};
export default { postNew };
