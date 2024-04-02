const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const authenticateCustomerToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.sendStatus(403); // Forbidden
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.sendStatus(403); // Forbidden
    }

    const user = await jwt.verify(token, process.env.CUSTOMER_ACCESS_TOKEN); 
    const isCustomer = await pool.query('SELECT * FROM customers WHERE customer_id = $1 AND username=$2', [user.userId, user.username]);
    
    if (isCustomer.rows.length){
      req.user = user;
      console.log('cUSTOMER AUTH')
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

module.exports = { authenticateCustomerToken };
