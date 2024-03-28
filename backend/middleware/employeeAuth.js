const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require("../db");

const authenticateEmployeeToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.sendStatus(403); // Forbidden
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.sendStatus(403); // Forbidden
    }

    const user = await jwt.verify(token, process.env.EMPLOYEE_ACCESS_TOKEN);
    
    const isEmployee = await pool.query('SELECT * FROM employees WHERE employee_id = $1 AND username=$2', [user.userId, user.username]);
    
    if (isEmployee.rows.length){
      req.user = user;
      next();
    }
    else {
      return res.status(403).send('Invalid Token');
    }
  } catch (err) {
    console.error('Error during token verification:', err.message);
    return res.status(403).send('Invalid Token Here');
  }
};


module.exports = { authenticateEmployeeToken };
