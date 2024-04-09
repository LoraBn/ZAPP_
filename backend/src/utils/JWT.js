const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateOwnerToken = async (userId, username) => {
  const user = { userId, username , userType:'owner'};
  const ownerToken = await jwt.sign(user, process.env.OWNER_ACCESS_TOKEN, { expiresIn: '14d' });
  return ownerToken;
};

const generateCustomerToken = async (userId,ownerId, username) => {
  const user = { userId, ownerId , username , userType:'customer'};
  const customerToken = await jwt.sign(user, process.env.CUSTOMER_ACCESS_TOKEN, { expiresIn: '14d' });
  return customerToken;
};

const generateEmployeeToken = async (userId, ownerId, username) => {
  const user = { userId, ownerId, username, userType:'employee' };
  const employeeToken = await jwt.sign(user, process.env.EMPLOYEE_ACCESS_TOKEN, { expiresIn: '14d' });
  return employeeToken;
};

module.exports = { generateOwnerToken, generateCustomerToken ,generateEmployeeToken};
