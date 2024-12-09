import dbClient from '../utils/db';

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
