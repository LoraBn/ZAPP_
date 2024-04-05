const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('../db');
const { joinRooms } = require('../utils/socket');

const authenticateUser = async (req, res, next) => {
    try {
      const io = req.app.get('io')
      const authHeader = req.headers["authorization"];
      const userType = req.headers["type"]; // Fixed typo
  
      if (!authHeader || !userType) {
        return res.status(403).send("Unauthorized"); // Added return statement and send error response
      }
      // Get token from header
      const token = authHeader && authHeader.split(" ")[1];
      switch (userType) {
        case "owner":
          let ownerUser = await jwt.verify(token, process.env.OWNER_ACCESS_TOKEN); // Renamed variable to avoid conflict
          const isOwner = await pool.query(
            "SELECT * FROM owners WHERE owner_id = $1 AND username=$2",
            [ownerUser.userId, ownerUser.username] // Fixed variable name
          );
  
          if (isOwner.rows.length) {
            req.user = ownerUser;
            const rooms= [`all${ownerUser.userId}`,`emp${ownerUser.userId}`,`cust${ownerUser.userId}`];
            joinRooms(rooms, io)
            return next();
          }
          break;
        case "customer":
          let customerUser = await jwt.verify(token, process.env.CUSTOMER_ACCESS_TOKEN); // Fixed variable name
          const isCustomer = await pool.query(
            "SELECT * FROM customers WHERE customer_id = $1 AND username=$2",
            [customerUser.userId, customerUser.username] // Fixed variable name
          );
          if (isCustomer.rows.length) {
            req.user = customerUser;
            const rooms= [`all${customerUser.ownerId}`,`cust${customerUser.ownerId}`];
            joinRooms(rooms, io)
            return next(); // Added return statement
          }
          break; // Added break statement
        case "employee":
          const employeeUser = await jwt.verify(token, process.env.EMPLOYEE_ACCESS_TOKEN); // Renamed variable to avoid conflict
          const isEmployee = await pool.query(
            "SELECT * FROM employees WHERE employee_id = $1 AND username=$2",
            [employeeUser.userId, employeeUser.username] // Fixed variable name
          );
  
          if (isEmployee.rows.length) {
            req.user = employeeUser;
            const rooms= [`all${employeeUser.ownerId}`,`emp${employeeUser.ownerId}`];
            joinRooms(rooms, io)
            return next(); // Added return statement
          }
          break; // Added break statement
      }
    } catch (error) {
      console.error(error); 
      res.status(500).send("Server Error"); 
    }
  };
  
  module.exports = { authenticateUser };
