import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * Handles the upload of a file or folder.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers['x-token'] - The authentication token.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.name - The name of the file or folder.
 * @param {string} req.body.type - The type of the file or folder (folder, file, image).
 * @param {string} [req.body.data] - The data of the file (not required for folders).
 * @param {string} [req.body.parentId] - The ID of the parent folder.
 * @param {boolean} [req.body.isPublic=false] - Whether the file or folder is public.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the status and message.
 */
const postUpload = (req, res) => {
  // Check if the authentication token is present in the request headers
  if (!req.headers['x-token']) return res.status(401).send({ error: 'Unauthorized' });
  const token = req.headers['x-token'];

  // Check if the user is authenticated by looking up the user ID in Redis
  return redisClient.get(`auth_${token}`).then(
    (userId) => {
      if (!userId) res.status(401).send({ error: 'Unauthorized' });

      // Validate the request body
      if (!req.body.name) return res.status(400).send({ error: 'Missing name' });
      if (
        !req.body.type
                || !['folder', 'file', 'image'].includes(req.body.type)
      ) return res.status(400).send({ error: 'Missing type' });
      if (!req.body.data && req.body.type !== 'folder') return res.status(400).send({ error: 'Missing data' });

      // If a parent folder is specified, check if it exists and is a folder
      if (req.body.parentId) {
        dbClient.db
          .collection('files')
          .findOne(
            { _id: ObjectId(req.body.parentId) },
            (error, parent) => {
              if (error || !parent) {
                return res
                  .status(400)
                  .send({ error: 'Parent not found' });
              }
              if (parent.type !== 'folder') {
                return res
                  .status(400)
                  .send({ error: 'Parent is not a folder' });
              }
              return null;
            },
          );
      }

      // Create a new file or folder object
      const file = {
        userId: ObjectId(userId),
        name: req.body.name,
        type: req.body.type,
        isPublic: req.body.isPublic || false,
        parentId: req.body.parentId || 0,
        data: req.body.data || null,
      };
      const path = `${
        process.env.FOLDER_PATH || '/tmp/files_manager'
      }/${uuidv4()}`;
      if (req.body.type !== 'folder') file.localPath = path;

      // Insert the new file or folder into the database
      return dbClient.db
        .collection('files')
        .insertOne(file, (error, result) => {
          if (error) {
            return res
              .status(400)
              .send({ error: 'Could not upload the file' });
          }

          // If the file type is not a folder, write the file data to the file system
          if (req.body.type !== 'folder') {
            fs.mkdir(
              `${
                process.env.FOLDER_PATH || '/tmp/files_manager'
              }`, { recursive: true },
              (err) => {
                if (err) {
                  res.status(500).send({
                    error: 'Error creating folder',
                  });
                } else {
                  fs.writeFile(
                    path,
                    Buffer.from(req.body.data, 'base64').toString('ascii'),
                    { recursive: true },
                    (error) => {
                      if (error) {
                        return res.status(400).send({
                          error: 'Could not upload the file',
                        });
                      }
                      return null;
                    },
                  );
                }
              },
            );
          }
          return res.status(201).send({
            id: result.insertedId,
            userId,
            name: req.body.name,
            type: req.body.type,
            isPublic: req.body.isPublic || false,
            parentId: req.body.parentId || 0,
          });
        });
    },
    () => res.status(401).send({ error: 'Unauthorized' }),
  );
};

export default { postUpload };
