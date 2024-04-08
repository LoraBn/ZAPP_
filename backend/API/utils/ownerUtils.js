
const pool = require("../db");

const getCustomerIdForOwner = async (ownerId, username) => {
  const result = await pool.query(
    "SELECT customer_id FROM customers WHERE owner_id = $1 AND username = $2",
    [ownerId, username]
  );
  return result.rows.length > 0 ? result.rows[0].customer_id : null;
};

const getEmployeeIdForOwner = async (ownerId, username) => {
  const result = await pool.query(
    "SELECT employee_id FROM employees WHERE owner_id = $1 AND username = $2",
    [ownerId, username]
  );
  return result.rows.length > 0 ? result.rows[0].customer_id : null;
};

const getEquipmentIdForOwner = async (ownerId, equipmentName) => {
  const result = await pool.query(
    "SELECT equipment_id FROM equipments WHERE owner_id = $1 AND name = $2",
    [ownerId, equipmentName]
  );
  return result.rows.length > 0 ? result.rows[0].equipment_id : null;
};

module.exports = {
    getCustomerIdForOwner,
    getEmployeeIdForOwner,
    getEquipmentIdForOwner,
}
