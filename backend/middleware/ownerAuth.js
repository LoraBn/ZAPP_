const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('../db')

const authenticateOwnerToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.sendStatus(403); // Forbidden
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.sendStatus(403); // Forbidden
    }

    const user = await jwt.verify(token, process.env.OWNER_ACCESS_TOKEN);
    const isOwner = await pool.query('SELECT * FROM owners WHERE owner_id = $1 AND username=$2', [user.userId, user.username]);
    
    if (isOwner.rows.length){
      req.user = user;
      next();
    }
    else {
      return res.status(403).send('Invalid Token');
    }
    
  } catch (err) {
    console.error('Invalid Token:', err.message);
    return res.status(403).send('Invalid Token');
  }
};

module.exports = { authenticateOwnerToken };
