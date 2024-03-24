const pool = require("../db");
const {
  generateOwnerToken,
  generateCustomerToken,
  generateEmployeeToken,
} = require("../utils/JWT");
const bcrypt = require("bcrypt");

const updateLoggingStatus = async (tableName, userName, value) => {
  try {
    const queryText = `UPDATE ${tableName} SET "isLoggedIn" = $1 WHERE username = $2`;
    const result = await pool.query(queryText, [value, userName]);
    return result.rowCount > 0 ? "success" : "failed";
  } catch (error) {
    console.error("Error updating logging status:", error);
    return "failed";
  }
};

const userSignIn = async (req, res) => {
  const { userName, password } = req.body;

  try {
    // Check if the username exists in any of the tables
    const query = `
      SELECT 'owner' AS user_type ,owner_id AS owner_id, owner_id AS user_id , password_hash FROM owners WHERE username = $1
      UNION ALL
      SELECT 'customer' AS user_type ,owner_id AS owner_id,  customer_id AS user_id , password_hash FROM customers WHERE username = $1
      UNION ALL
      SELECT 'employee' AS user_type ,owner_id AS owner_id, employee_id AS user_id , password_hash FROM employees WHERE username = $1
    `;
    const result = await pool.query(query, [userName]);

    // Check if any user record exists for the given username
    if (result.rows.length === 0) {
      return res
        .status(402)
        .json({ error_message: "Invalid username or password" });
    }

    const userRecord = result.rows[0];
    let userType, token;

    // Compare the provided password with the hashed password in the database
    const validPassword = await bcrypt.compare(
      password,
      userRecord.password_hash
    );
    if (!validPassword) {
      return res
        .status(401)
        .json({ error_message: "Invalid username or password" });
    }

    // Determine user type and generate token accordingly
    if (userRecord.user_type === "owner") {
      userType = "owner";
      token = await generateOwnerToken(userRecord.user_id, userName);
    } else if (userRecord.user_type === "customer") {
      userType = "customer";
      token = await generateCustomerToken(
        userRecord.user_id,
        userRecord.owner_id,
        userName
      );
    } else if (userRecord.user_type === "employee") {
      userType = "employee";
      token = await generateEmployeeToken(
        userRecord.user_id,
        userRecord.owner_id,
        userName
      );
    }

    // Update logging status
    await updateLoggingStatus(`${userType}s`, userName, true);

    res.status(200).json({ userId: userRecord.user_id, userType, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error_message: "Internal server error" });
  }
};

module.exports = {
  userSignIn,
};
