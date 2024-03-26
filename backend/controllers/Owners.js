const pool = require("../db");
const { generateOwnerToken } = require("../utils/JWT");
const bcrypt = require("bcrypt");
const {
  getCustomerIdForOwner,
  getEquipmentIdForOwner,
  getEmployeeIdForOwner,
} = require("../utils/ownerUtils");

const ownerSignUp = async (req, res) => {
  try {
    const { name, lastName, userName, password } = req.body;

    // Check if the username is already registered
    const userNameExists = await pool.query(
      "SELECT * FROM owners WHERE username = $1",
      [userName]
    );

    if (userNameExists.rows.length > 0) {
      return res
        .status(401)
        .json({ error_message: "Username already registered" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO owners(name, last_name, username, password_hash)
      VALUES($1, $2, $3, $4)
      RETURNING owner_id, username`;

    const result = await pool.query(insertQuery, [
      name,
      lastName,
      userName,
      hashedPass,
    ]);

    const userId = result.rows[0].owner_id;

    const token = await generateOwnerToken(userId, userName);

    if (!token) {
      console.error("Error generating token");
      return res.status(500).json({ error_message: "Error generating token" });
    }

    console.log("Generated token:", token);

    res.status(201).json({ userId, token });
  } catch (error) {
    console.error("Error during owner sign-up:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const ownerUpdate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, lastName, userName, password } = req.body;

    // Check if the owner exists
    const ownerExists = await pool.query(
      "SELECT * FROM owners WHERE owner_id = $1",
      [userId]
    );

    if (ownerExists.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No owner found with user ID: " + userId });
    }

    const existingOwner = ownerExists.rows[0];

    const updatedName = name || existingOwner.name;
    const updatedLastName = lastName || existingOwner.last_name;
    const updatedUserName = userName || existingOwner.username;
    const updatedPassword = password
      ? await bcrypt.hash(password, 10)
      : existingOwner.password_hash;

    const updateQuery = {
      text: `
        UPDATE owners
        SET name = $1, last_name = $2, username = $3, password_hash = $4
        WHERE owner_id = $5
      `,
      values: [
        updatedName,
        updatedLastName,
        updatedUserName,
        updatedPassword,
        userId,
      ],
    };

    const results = await pool.query(updateQuery);

    if (results.rowCount > 0) {
      const newToken = await generateOwnerToken(userId, updatedUserName);
      return res
        .status(200)
        .json({ message: "Owner updated successfully", token: newToken });
    }

    return res
      .status(404)
      .json({ error_message: "No owner found with user ID: " + userId });
  } catch (error) {
    console.error("Error updating owner:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getCustomersList = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const queryText = "SELECT * FROM customers WHERE owner_id=$1";
    pool.query(queryText, [ownerId], (err, results) => {
      if (err) throw err;
      res.status(200).json({ customers: results.rows });
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error_message: error.message });
  }
};

const getEmployeeList = async (req, res) => {
  try {
    const { userId } = req.user;
    const queryText = "SELECT * FROM employees WHERE owner_id = $1";
    pool.query(queryText, [userId], (err, results) => {
      if (err) throw err;
      res.status(200).json({ employees: results.rows });
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error_message: error.message });
  }
};

const createEmployeeAccount = async (req, res) => {
  try {
    const { name, lastName, userName, salary, password } = req.body;
    const ownerId = req.user.userId;

    const userExists = await pool.query(
      "SELECT * FROM employees WHERE username = $1",
      [userName]
    );

    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ error_message: "Username is already taken" });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const queryText = `INSERT INTO employees ( owner_id, name, last_name, username, password_hash, salary)
  VALUES ( $1,$2,$3, $4,$5, $6)`;
    pool.query(
      queryText,
      [ownerId, name, lastName, userName, hashedPass, salary],
      (err, results) => {
        if (err) {
          console.error("Error creating employee account:", err);
          res.status(500).json({ error_message: "Internal Server Error" });
        } else {
          res.status(201).json({ user_info: { userName, password } });
        }
      }
    );
  } catch (error) {
    console.error("Error during employee account creation:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const employeeUserName = req.params.username;

    const checkEmployeeQuery =
      "SELECT * FROM employees WHERE owner_id = $1 AND username = $2";
    const checkEmployeeResult = await pool.query(checkEmployeeQuery, [
      ownerId,
      employeeUserName,
    ]);

    if (checkEmployeeResult.rows.length > 0) {
      const deleteEmployeeQuery =
        "DELETE FROM employees WHERE owner_id = $1 AND username = $2";
      await pool.query(deleteEmployeeQuery, [ownerId, employeeUserName]);
      res.status(202).json({ message: "Employee deleted successfully" });
    } else {
      res.status(404).json({ error_message: "Employee not found" });
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updateEmployeeAccount = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const employeeUsername = req.params.username;
    const { name, lastName, userName, password, salary } = req.body;

    // Check if the employee exists
    const employeeExistsQuery =
      "SELECT * FROM employees WHERE username = $1 AND owner_id = $2";
    const employeeExistsResult = await pool.query(employeeExistsQuery, [
      employeeUsername,
      ownerId,
    ]);

    if (employeeExistsResult.rows.length === 0) {
      return res.status(404).json({
        error_message: "No employee found with the provided username",
      });
    }

    const existingEmployee = employeeExistsResult.rows[0];

    // Determine the values to update
    const updatedValues = {
      name: name || existingEmployee.name,
      last_name: lastName || existingEmployee.last_name,
      username: userName || existingEmployee.username,
      password_hash: password
        ? await bcrypt.hash(password, 10)
        : existingEmployee.password_hash,
      salary: salary || existingEmployee.salary,
    };

    // Update the employee
    const updateQuery = {
      text: `
        UPDATE employees
        SET name = $1, last_name = $2, username = $3, password_hash = $4 salary = $5
        WHERE username = $6 AND owner_id = $7
        RETURNING employee_id`,
      values: [
        updatedValues.name,
        updatedValues.last_name,
        updatedValues.username,
        updatedValues.password_hash,
        updatedValues.salary,
        employeeUsername,
        ownerId,
      ],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rowCount > 0) {
      res.status(200).json({
        message: "Employee updated successfully!",
        user_info: { username: updatedValues.username, password: password },
      });
    } else {
      res.status(404).json({
        error_message: "No employee found with the provided username",
      });
    }
  } catch (error) {
    console.error("Error updating employee account:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createCustomerAccount = async (req, res) => {
  try {
    const {
      name,
      lastName,
      userName,
      password,
      address,
      planName,
      equipementName,
    } = req.body;

    // Check if the username already exists
    const userExists = await pool.query(
      "SELECT * FROM customers WHERE username = $1",
      [userName]
    );

    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ error_message: "Username is already taken" });
    }

    const ownerId = req.user.userId;
    const equipementResult = await pool.query(
      "SELECT * FROM equipments WHERE owner_id = $1 AND name = $2 RETURNING equipement_id",
      [ownerId, equipementName]
    );
    const planResult = await pool.query(
      "SELECT * FROM plans_prices WHERE plan_name = $1 RETURNING plan_id",
      [planName]
    );

    const equipementId = equipementResult.rows[0].equipement_id;
    const planId = planResult.rows[0].plan_id;

    const hashedPass = await bcrypt.hash(password, 10);

    const queryText = `
      INSERT INTO customers(owner_id, name, last_name, username, password_hash, address, plan_id, equipement_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING customer_id`;

    pool.query(
      queryText,
      [
        ownerId,
        name,
        lastName,
        userName,
        hashedPass,
        address,
        planId,
        equipementId,
      ],
      async (err, result) => {
        if (err) {
          console.error("Error creating customer account:", err);
          res.status(500).json({ error_message: "Internal Server Error" });
        } else {
          res.status(201).json({ user_info: { userName, password } });
        }
      }
    );
  } catch (error) {
    console.error("Error during customer account creation:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updateCustomerAccount = async (req, res) => {
  try {
    const ownerUserId = req.user.userId;
    const customerUsername = req.params.username;
    const {
      name,
      lastName,
      userName,
      password,
      address,
      planName,
      equipementName,
    } = req.body;

    // Check if the customer exists
    const customerExists = await pool.query(
      "SELECT * FROM customers WHERE username = $1 AND owner_id = $2",
      [customerUsername, ownerUserId]
    );

    if (customerExists.rows.length === 0) {
      return res.status(404).json({
        error_message: "No customer found with the provided username",
      });
    }

    const ownerId = req.user.userId;

    // Get existing customer details
    const existingCustomer = customerExists.rows[0];

    // Determine the values to update
    const updatedValues = {
      name: name || existingCustomer.name,
      last_name: lastName || existingCustomer.last_name,
      username: userName || existingCustomer.username,
      password_hash: password
        ? await bcrypt.hash(password, 10)
        : existingCustomer.password_hash,
      address: address || existingCustomer.address,
      plan_id: planName
        ? (
            await pool.query(
              "SELECT * FROM plans_prices WHERE plan_name = $1 RETURNING plan_id",
              [planName]
            )
          ).rows[0].plan_id
        : existingCustomer.plan_id,
      equipement_id: equipementName
        ? (
            await pool.query(
              "SELECT * FROM equipments WHERE owner_id = $1 AND name = $2 RETURNING equipement_id",
              [ownerId, equipementName]
            )
          ).rows[0].equipement_id
        : existingCustomer.equipement_id,
    };

    const updateQuery = {
      text: `
        UPDATE customers
        SET name = $1, last_name = $2, username = $3, password_hash = $4, address = $5, plan_id = $6, equipement_id = $7
        WHERE username = $8 AND owner_id = $9
        RETURNING customer_id`,
      values: [
        updatedValues.name,
        updatedValues.last_name,
        updatedValues.username,
        updatedValues.password_hash,
        updatedValues.address,
        updatedValues.plan_id,
        updatedValues.equipement_id,
        customerUsername,
        ownerId,
      ],
    };

    const result = await pool.query(updateQuery);

    if (result.rowCount > 0) {
      res.status(201).json({
        message: "Customer updated succesfully!",
        user_info: { username: updatedValues.username, password: password },
      });
    } else {
      res.status(404).json({
        error_message: "No customer found with the provided username",
      });
    }
  } catch (error) {
    console.error("Error updating customer account:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const customerUserName = req.params.username;

    const checkCustomerQuery =
      "SELECT * FROM customers WHERE owner_id = $1 AND username = $2";
    const checkCustomerResult = await pool.query(checkCustomerQuery, [
      ownerId,
      customerUserName,
    ]);

    if (checkCustomerResult.rows.length > 0) {
      const deleteCustomerQuery =
        "DELETE FROM customers WHERE owner_id = $1 AND username = $2";
      await pool.query(deleteCustomerQuery, [ownerId, customerUserName]);
      res.status(202).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error_message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createEquipment = async (req, res) => {
  const { name, price, description, status } = req.body;
  const owner_id = req.user.userId;

  const isExisted = await pool.query(
    "SELECT * FROM equipments WHERE name=$1 AND owner_id=$2",
    [name, owner_id]
  );

  if (isExisted.rows.length > 0) {
    res.status(409).json({ error_message: "This equipment already exists." });
    return;
  }

  // Passed validation
  const queryText = `INSERT INTO equipments (owner_id, name, price, description, status)
    VALUES($1, $2, $3, $4, $5)`;

  pool.query(
    queryText,
    [owner_id, name, price, description, status],
    (err, results) => {
      if (err) {
        console.error("Error creating equipment:", err);
        res.status(500).json({ error_message: "Internal Server Error" });
      } else {
        let room = `all${owner_id}`;
        req.app.get("io").to(room).emit("newEquipment", {
          name,
          price,
          description,
          status,
        });
        console.log("equipment sent to room", room);
        res.status(201).json({ message: "Equipment added successfully!" });
      }
    }
  );
};

const getEquipments = async (req, res) => {
  try {
    const queryText = "SELECT * FROM equipments WHERE owner_id = $1";
    const { userId } = req.user;
    pool.query(queryText, [userId], (err, results) => {
      if (err) throw err;
      res.status(200).json({ equipments: results.rows });
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error_message: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const equipmentName = req.params.name;
    const oldName = equipmentName;
    const ownerId = req.user.userId;
    console.log("updating the equipment");

    const { name, price, description, status } = req.body;

    // Check if the equipment exists
    const equipmentExistsQuery =
      "SELECT * FROM equipments WHERE name = $1 AND owner_id = $2";
    const equipmentExistsResult = await pool.query(equipmentExistsQuery, [
      equipmentName,
      ownerId,
    ]);

    if (equipmentExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No equipment found with the provided name" });
    }

    // Update the equipment
    const updateQuery = {
      text: `
        UPDATE equipments
        SET name = $1, price = $2, description = $3, status = $4
        WHERE name = $5 AND owner_id = $6
        RETURNING *`,
      values: [
        name || equipmentExistsResult.rows[0].name,
        price || equipmentExistsResult.rows[0].price,
        description || equipmentExistsResult.rows[0].description,
        status || equipmentExistsResult.rows[0].status,
        equipmentName,
        ownerId,
      ],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rows.length > 0) {
      let room = `all${ownerId}`;
      req.app.get("io").emit("updateEquipment", {
        oldName,
        name,
        price,
        description,
        status,
      });
      console.log("equipment sent to room", room);
      res.status(200).json({ message: "Equipment updated successfully!" });
    } else {
      res
        .status(404)
        .json({ error_message: "No equipment found with the provided name" });
    }
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const equipmentName = req.params.name;
    const deletedName = equipmentName;
    const ownerId = req.user.userId;

    // Check if the equipment exists
    const equipmentExistsQuery =
      "SELECT * FROM equipments WHERE name = $1 AND owner_id = $2";
    const equipmentExistsResult = await pool.query(equipmentExistsQuery, [
      equipmentName,
      ownerId,
    ]);

    if (!equipmentExistsResult.rows.length) {
      return res
        .status(404)
        .json({ error_message: "No equipment found with the provided name" });
    }

    // Delete the equipment
    const deleteQuery =
      "DELETE FROM equipments WHERE name = $1 AND owner_id = $2";
    const deleteResult = await pool.query(deleteQuery, [
      equipmentName,
      ownerId,
    ]);

    if (deleteResult.rowCount > 0) {
      let room = `all${ownerId}`;
      req.app.get("io").emit("deleteEquipment", {
        deletedName,
      });
      console.log("equipment sent to room", room);
      res.status(200).json({ message: "Equipment deleted successfully!" });
    } else {
      res.status(500).json({ error_message: "Error deleting equipment" });
    }
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const queryText = "SELECT * FROM announcements WHERE owner_id = $1";

    const announcementsResult = await pool.query(queryText, [ownerId]);

    if (announcementsResult.rows.length > 0) {
      res.status(200).json({ announcements: announcementsResult.rows });
    } else {
      res
        .status(404)
        .json({ error_message: "No announcements found for the owner" });
    }
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { target_type, announcement_title, announcement_message } = req.body;

    const queryText = `
      INSERT INTO announcements (owner_id, target_type, announcement_title, announcement_message)
      VALUES ($1, $2, $3, $4)
      RETURNING announcement_id`;

    const result = await pool.query(queryText, [
      ownerId,
      target_type,
      announcement_title,
      announcement_message,
    ]);

    let room;
    switch (target_type) {
      case "BOTH":
        room = `all${req.user.userId}`;
        break;
      case "EMPLOYEE":
        room = `emp${req.user.userId}`;
        break;
      case "CUSTOMER":
        room = `cust${req.user.userId}`;
        break;
    }

    req.app
      .get("io")
      .to(room)
      .emit("newAnnouncement", { announcement_title, announcement_message });
    console.log("annoncement sent to room", room);
    res.status(201).json({
      message: "Announcement created",
      announcementTitle: announcement_title,
      announcementMssage: announcement_message,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const announcementId = req.params.id;

    const queryText =
      "DELETE FROM announcements WHERE announcement_id = $1 AND owner_id = $2";

    const result = await pool.query(queryText, [announcementId, ownerId]);

    if (result.rowCount > 0) {
      res.status(202).json({ message: "Announcement deleted successfully" });
    } else {
      res
        .status(404)
        .json({ error_message: "No announcement found with the provided ID" });
    }
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getKwhPrice = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const queryText =
      "SELECT * FROM kwh_prices  WHERE owner_id = $1 RETURNING price_id";
    const results = pool.query(queryText, [ownerId]);
    res.status(200).json({ price: results[0] });
  } catch (error) {}
  console.error("Error fetching plans:", error);
  res.status(500).json({ error_message: "Internal Server Error" });
};

const createPrice = async (req, res) => {
  try {
    const { kwh_price } = req.body;
    const ownerId = req.user.userId;

    // Insert new price
    const insertPriceQuery =
      "INSERT INTO kwh_prices (kwh_price, owner_id) VALUES ($1, $2) RETURNING price_id";
    const newPrice = await pool.query(insertPriceQuery, [kwh_price, ownerId]);

    // Emit notification to relevant room
    let room = `all${ownerId}`;
    req.app.get("io").to(room).emit("newPrice", {
      price_id: newPrice.rows[0].price_id,
      kwh_price,
      date: newPrice.rows[0].date,
    });

    // Send response
    res.status(201).json({
      price_id: newPrice.rows[0].price_id,
      message: "Price created successfully!",
    });
  } catch (error) {
    console.error("Error creating price:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updatePrice = async (req, res) => {
  try {
    const priceId = req.params.id;
    const ownerId = req.user.userId;
    console.log("updating the price");

    const { kwh_price } = req.body;

    // Check if the price exists
    const priceExistsQuery =
      "SELECT * FROM kwh_prices WHERE price_id = $1 AND owner_id = $2";
    const priceExistsResult = await pool.query(priceExistsQuery, [
      priceId,
      ownerId,
    ]);

    if (priceExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No price found with the provided ID" });
    }

    // Update the price
    const updateQuery = {
      text: `
        UPDATE kwh_prices
        SET kwh_price = $1
        WHERE price_id = $2 AND owner_id = $3
        RETURNING *`,
      values: [
        kwh_price || priceExistsResult.rows[0].kwh_price,
        priceId,
        ownerId,
      ],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rows.length > 0) {
      let room = `all${ownerId}`;
      req.app.get("io").to(room).emit("updatePrice", {
        price_id: priceId,
        kwh_price,
      });
      console.log("price sent to room", room);
      res.status(200).json({ message: "Price updated successfully!" });
    } else {
      res
        .status(404)
        .json({ error_message: "No price found with the provided ID" });
    }
  } catch (error) {
    console.error("Error updating price:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deletePrice = async (req, res) => {
  try {
    const priceId = req.params.id;
    const ownerId = req.user.userId;

    // Delete the price
    const deleteQuery = {
      text: "DELETE FROM kwh_prices WHERE price_id = $1 AND owner_id = $2",
      values: [priceId, ownerId],
    };

    const deleteResult = await pool.query(deleteQuery);

    if (deleteResult.rowCount > 0) {
      let room = `all${ownerId}`;
      req.app.get("io").to(room).emit("deletePrice", { price_id: priceId });
      res.status(202).json({ message: "Price deleted successfully" });
    } else {
      res
        .status(404)
        .json({ error_message: "No price found with the provided ID" });
    }
  } catch (error) {
    console.error("Error deleting price:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getPlans = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const queryText = "SELECT * FROM plans_prices WHERE owner_id = $1";
    const plans = await pool.query(queryText, [ownerId]);
    res.status(200).json({ plans: plans.rows });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createPlan = async (req, res) => {
  try {
    const { plan_name, plan_price } = req.body;
    const ownerId = req.user.userId;

    // Check if the plan name already exists
    const checkExistingPlanQuery =
      "SELECT COUNT(*) FROM plans_prices WHERE plan_name = $1 AND owner_id = $2";
    const existingPlan = await pool.query(checkExistingPlanQuery, [
      plan_name,
      ownerId,
    ]);

    if (existingPlan.rows[0].count > 0) {
      return res
        .status(400)
        .json({ error_message: "Plan name already exists." });
    }

    // Insert the new plan if the plan name is unique
    const insertPlanQuery =
      "INSERT INTO plans_prices (plan_name, plan_price, owner_id) VALUES ($1, $2, $3) RETURNING plan_id";
    const newPlan = await pool.query(insertPlanQuery, [
      plan_name,
      plan_price,
      ownerId,
    ]);

    // Emit notification to relevant room
    let room = `emp${ownerId}`;
    req.app.get("io").to(room).emit("newPlan", {
      plan_id: newPlan.rows[0].plan_id,
      plan_name,
      plan_price,
      date: newPlan.rows[0].date, // Assuming date is returned by the query
    });
    console.log("announcement sent to room", room);

    // Send response
    res.status(201).json({
      plan_id: newPlan.rows[0].plan_id,
      message: "Plan created successfully!",
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const { plan_price } = req.body;
    const ownerId = req.user.userId;

    // Check if the plan exists
    const planExistsQuery =
      "SELECT * FROM plans_prices WHERE plan_id = $1 AND owner_id = $2";
    const planExistsResult = await pool.query(planExistsQuery, [
      planId,
      ownerId,
    ]);

    if (planExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No plan found with the provided ID" });
    }

    const existingPlan = planExistsResult.rows[0];

    // Update the plan
    const updateQuery = {
      text: `
        UPDATE plans_prices
        SET plan_price = $1
        WHERE plan_id = $2 AND owner_id = $3
        RETURNING date`,
      values: [plan_price, planId, ownerId],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rowCount > 0) {
      console.log("im here");
      let room = `emp${ownerId}`;
      req.app.get("io").to(room).emit("updatePlan", {
        plan_id: planId,
        plan_name: existingPlan.plan_name,
        plan_price,
        date: updateResult.rows[0].date,
      });
      res.status(200).json({
        plan_id: planId,
        message: "Plan updated successfully!",
      });
    } else {
      res
        .status(404)
        .json({ error_message: "No plan found with the provided ID" });
    }
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const ownerId = req.user.userId;

    const deleteQuery = {
      text: "DELETE FROM plans_prices WHERE plan_id = $1 AND owner_id = $2",
      values: [planId, ownerId],
    };

    const deleteResult = await pool.query(deleteQuery);

    if (deleteResult.rowCount > 0) {
      let room = `emp${ownerId}`;
      req.app.get("io").to(room).emit("deletePlan", { plan_id: planId });
      res.status(202).json({ message: "Plan deleted successfully" });
    } else {
      res
        .status(404)
        .json({ error_message: "No plan found with the provided ID" });
    }
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getElectricSchedule = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const queryText = "SELECT * FROM electric_schedules WHERE owner_id = $1";
    const schedule = await pool.query(queryText, [ownerId]);
    res.status(200).json({ schedule: schedule.rows });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createElectricSchedule = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { equipment_id, daily_schedule } = req.body;

    // Check if the equipment exists and is owned by the provided owner
    const isEquipment = await pool.query(
      "SELECT * FROM equipments WHERE owner_id =$1 AND equipment_id = $2",
      [ownerId, equipment_id]
    );

    if (isEquipment.rows.length === 0) {
      return res.status(402).json({
        error_message: "Equipment doesn't exist or is not owned by the owner",
      });
    }

    // Proceed with creating electric schedule
    const queryText = `
      INSERT INTO electric_schedules(owner_id, equipment_id, daily_schedule)
      VALUES($1, $2, ARRAY[$3]::time_range[])
      RETURNING schedule_id`;

    const result = await pool.query(queryText, [
      ownerId,
      equipment_id,
      daily_schedule,
    ]);

    if (result.rows.length > 0) {
      res.status(201).json({
        schedule_id: result.rows[0].schedule_id,
        message: "Electric schedule created successfully!",
      });
    } else {
      res
        .status(500)
        .json({ error_message: "Failed to create electric schedule" });
    }
  } catch (error) {
    console.error("Error creating electric schedule:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updateElectricSchedule = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const scheduleId = req.params.id;
    const { equipment_id, daily_schedule } = req.body;

    // Check if the electric schedule exists and is owned by the provided owner
    const scheduleExistsQuery =
      "SELECT * FROM electric_schedules WHERE schedule_id = $1 AND owner_id = $2";
    const scheduleExistsResult = await pool.query(scheduleExistsQuery, [
      scheduleId,
      ownerId,
    ]);

    if (scheduleExistsResult.rows.length === 0) {
      return res.status(404).json({
        error_message: "No electric schedule found with the provided ID",
      });
    }

    const existingSchedule = scheduleExistsResult.rows[0];

    // Determine the values to update
    const updatedValues = {
      equipment_id: equipment_id || existingSchedule.equipment_id,
      daily_schedule: daily_schedule || existingSchedule.daily_schedule,
    };

    // Update the electric schedule
    const updateQuery = {
      text: `
        UPDATE electric_schedules
        SET equipment_id = $1, daily_schedule = $2
        WHERE schedule_id = $3 AND owner_id = $4
        RETURNING schedule_id`,
      values: [
        updatedValues.equipment_id,
        updatedValues.daily_schedule,
        scheduleId,
        ownerId,
      ],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rowCount > 0) {
      res.status(200).json({
        schedule_id: updateResult.rows[0].schedule_id,
        message: "Electric schedule updated successfully!",
      });
    } else {
      res
        .status(500)
        .json({ error_message: "Failed to update electric schedule" });
    }
  } catch (error) {
    console.error("Error updating electric schedule:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteElectricSchedule = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const scheduleId = req.params.id;

    // Check if the electric schedule exists and is owned by the provided owner
    const scheduleExistsQuery =
      "SELECT * FROM electric_schedules WHERE schedule_id = $1 AND owner_id = $2";
    const scheduleExistsResult = await pool.query(scheduleExistsQuery, [
      scheduleId,
      ownerId,
    ]);

    if (scheduleExistsResult.rows.length === 0) {
      return res.status(404).json({
        error_message: "No electric schedule found with the provided ID",
      });
    }

    // Delete the electric schedule
    const deleteQuery = {
      text: "DELETE FROM electric_schedules WHERE schedule_id = $1 AND owner_id = $2",
      values: [scheduleId, ownerId],
    };

    const deleteResult = await pool.query(deleteQuery);

    if (deleteResult.rowCount > 0) {
      res
        .status(200)
        .json({ message: "Electric schedule deleted successfully!" });
    } else {
      res
        .status(500)
        .json({ error_message: "Failed to delete electric schedule" });
    }
  } catch (error) {
    console.error("Error deleting electric schedule:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllBills = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const queryText = "SELECT * FROM bills WHERE owner_id = $1";
    const result = await pool.query(queryText, [ownerId]);

    res.status(200).json({ bills: result.rows });
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getCustomerBill = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const username = req.params.username;

    const customerId = await getCustomerIdForOwner(ownerId, username);

    if (!customerId) {
      return res.status(404).json({ error_message: "Customer not found" });
    }

    // Your query to get the bill for the specified customer
    const queryText =
      "SELECT * FROM bills WHERE owner_id = $1 AND customer_id = $2";
    const result = await pool.query(queryText, [ownerId, customerId]);

    res.status(200).json({ bill: result.rows[0] });
  } catch (error) {
    console.error("Error fetching customer bill:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createBill = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const {
      customerUsername,
      previous_meter,
      current_meter,
      total_kwh,
      total_amount,
      billing_status,
      remaining_amount,
    } = req.body;

    const customerId = await getCustomerIdForOwner(ownerId, customerUsername);

    if (!customerId) {
      return res
        .status(401)
        .json({ error_message: "Error finding the customer" });
    }

    const queryText = `
      INSERT INTO bills(customer_id, owner_id, previous_meter, current_meter, total_kwh, total_amount, billing_status, remaining_amount, billing_date)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING bill_id`;

    const result = await pool.query(queryText, [
      customerId,
      ownerId,
      previous_meter,
      current_meter,
      total_kwh,
      total_amount,
      billing_status,
      remaining_amount,
    ]);

    if (result.rows.length > 0) {
      res.status(201).json({
        bill_id: result.rows[0].bill_id,
        message: "Bill created successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to create bill" });
    }
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updateBill = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const billId = req.params.id;
    const {
      customerUsername,
      previous_meter,
      current_meter,
      total_kwh,
      total_amount,
      billing_status,
      remaining_amount,
    } = req.body;

    // Get the customer ID associated with the provided username and owner ID
    const customerId = await getCustomerIdForOwner(ownerId, customerUsername);

    if (!customerId) {
      return res
        .status(401)
        .json({ error_message: "Error finding the customer" });
    }

    // Check if the bill exists and is owned by the provided owner
    const billExistsQuery =
      "SELECT * FROM bills WHERE bill_id = $1 AND owner_id = $2";
    const billExistsResult = await pool.query(billExistsQuery, [
      billId,
      ownerId,
    ]);

    if (billExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No bill found with the provided ID" });
    }

    const existingBill = billExistsResult.rows[0];

    // Determine the values to update
    const updatedValues = {
      customer_id: customerId || existingBill.customer_id,
      previous_meter: previous_meter || existingBill.previous_meter,
      current_meter: current_meter || existingBill.current_meter,
      total_kwh: total_kwh || existingBill.total_kwh,
      total_amount: total_amount || existingBill.total_amount,
      billing_status: billing_status || existingBill.billing_status,
      remaining_amount: remaining_amount || existingBill.remaining_amount,
    };

    // Update the bill
    const updateQuery = {
      text: `
        UPDATE bills
        SET customer_id = $1, previous_meter = $2, current_meter = $3, total_kwh = $4, total_amount = $5, billing_status = $6, remaining_amount = $7
        WHERE bill_id = $8 AND owner_id = $9
        RETURNING bill_id`,
      values: [
        updatedValues.customer_id,
        updatedValues.previous_meter,
        updatedValues.current_meter,
        updatedValues.total_kwh,
        updatedValues.total_amount,
        updatedValues.billing_status,
        updatedValues.remaining_amount,
        billId,
        ownerId,
      ],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rowCount > 0) {
      res.status(200).json({
        bill_id: updateResult.rows[0].bill_id,
        message: "Bill updated successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to update bill" });
    }
  } catch (error) {
    console.error("Error updating bill:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteBill = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const billId = req.params.id;

    // Check if the bill exists and is owned by the provided owner
    const billExistsQuery =
      "SELECT * FROM bills WHERE bill_id = $1 AND owner_id = $2";
    const billExistsResult = await pool.query(billExistsQuery, [
      billId,
      ownerId,
    ]);

    if (billExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No bill found with the provided ID" });
    }

    // Proceed with deleting the bill
    const deleteQuery = {
      text: "DELETE FROM bills WHERE bill_id = $1 AND owner_id = $2",
      values: [billId, ownerId],
    };

    const deleteResult = await pool.query(deleteQuery);

    if (deleteResult.rowCount > 0) {
      res.status(202).json({ message: "Bill deleted successfully" });
    } else {
      res.status(500).json({ error_message: "Failed to delete bill" });
    }
  } catch (error) {
    console.error("Error deleting bill:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getExpenses = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const queryText = `
      SELECT exp.*, emp.username
      FROM expenses AS exp
      INNER JOIN employees AS emp ON exp.employee_id = emp.employee_id
      WHERE exp.owner_id = $1`;

    const result = await pool.query(queryText, [ownerId]);

    res.status(200).json({ expenses: result.rows });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createExpense = async (req, res) => {
  try {
    const { username, description, amount } = req.body;
    const ownerId = req.user.userId;

    // Retrieve employee id
    const employeeQuery = `
      SELECT employee_id FROM employees 
      WHERE username = $1 AND owner_id = $2`;
    const employeeResult = await pool.query(employeeQuery, [username, ownerId]);

    if (employeeResult.rows.length === 0) {
      return res
        .status(401)
        .json({ error_message: "Error finding the employee" });
    }

    const employeeId = employeeResult.rows[0].employee_id;

    // Insert expense
    const insertQuery = `
      INSERT INTO expenses (owner_id, employee_id, description, amount) 
      VALUES ($1, $2, $3, $4)
      RETURNING expense_id, expense_date`;
    const insertResult = await pool.query(insertQuery, [
      ownerId,
      employeeId,
      description,
      amount,
    ]);

    if (insertResult.rows.length > 0) {
      let room = `emp${ownerId}`;
      req.app.get("io").to(room).emit("newExpense", {
        expense_id: insertResult.rows[0].expense_id,
        username,
        description,
        amount,
        employee_id: employeeId,
        expense_date: insertResult.rows[0].expense_date,
      });
      res.status(201).json({
        expenseId: insertResult.rows[0].expense_id,
        message: "Expense created successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to create expense" });
    }
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updateExpense = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const expenseId = req.params.id;
    const { username, description, amount } = req.body;

    // Check if the expense exists and is owned by the provided owner
    const expenseExistsQuery =
      "SELECT exp.*, emp.username FROM expenses AS exp INNER JOIN employees AS emp ON exp.employee_id = emp.employee_id WHERE exp.expense_id = $1 AND exp.owner_id = $2";
    const expenseExistsResult = await pool.query(expenseExistsQuery, [
      expenseId,
      ownerId,
    ]);

    if (expenseExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No expense found with the provided ID" });
    }

    const existingExpense = expenseExistsResult.rows[0];
    const employeeId = existingExpense.employee_id;

    // Get the employee username associated with the provided employee ID
    const employeeUsernameQuery =
      "SELECT username FROM employees WHERE employee_id = $1";
    const employeeUsernameResult = await pool.query(employeeUsernameQuery, [
      employeeId,
    ]);

    if (employeeUsernameResult.rows.length === 0) {
      return res
        .status(500)
        .json({ error_message: "Failed to retrieve employee username" });
    }

    const employeeUsername = employeeUsernameResult.rows[0].username;

    // Determine the values to update
    const updatedValues = {
      employee_id: employeeId,
      description: description || existingExpense.description,
      amount: amount || existingExpense.amount,
    };

    // Update the expense
    const updateQuery = {
      text: `
        UPDATE expenses
        SET employee_id = $1, description = $2, amount = $3
        WHERE expense_id = $4 AND owner_id = $5
        RETURNING expense_date`,
      values: [
        updatedValues.employee_id,
        updatedValues.description,
        updatedValues.amount,
        expenseId,
        ownerId,
      ],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rowCount > 0) {
      const { expense_date } = updateResult.rows[0]; // Retrieve the updated expense date

      // Emit the update event with necessary details
      req.app.get("io").emit("updateExpense", {
        oldId: expenseId,
        expense_id: expenseId,
        username: employeeUsername,
        amount: updatedValues.amount,
        description: updatedValues.description,
        expense_date: expense_date, // Sending the updated expense date
      });

      res.status(200).json({
        expense_id: expenseId, // Using `expenseId` instead of `updateResult.rows[0].expense_id`
        username: employeeUsername,
        message: "Expense updated successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to update expense" });
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const expenseId = req.params.id;

    // Check if the expense exists and is owned by the provided owner
    const expenseExistsQuery =
      "SELECT * FROM expenses WHERE expense_id = $1 AND owner_id = $2";
    const expenseExistsResult = await pool.query(expenseExistsQuery, [
      expenseId,
      ownerId,
    ]);

    if (expenseExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No expense found with the provided ID" });
    }

    // Proceed with deleting the expense
    const deleteQuery = {
      text: "DELETE FROM expenses WHERE expense_id = $1 AND owner_id = $2",
      values: [expenseId, ownerId],
    };

    const deleteResult = await pool.query(deleteQuery);

    if (deleteResult.rowCount > 0) {
      let room = `emp${ownerId}`;
      req.app
        .get("io")
        .to(room)
        .emit("deleteExpense", { deletedId: expenseId });
      res.status(202).json({ message: "Expense deleted successfully" });
    } else {
      res.status(500).json({ error_message: "Failed to delete expense" });
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createSupportTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { customer_username, ticket_title, ticket_message, is_urgent } =
      req.body;

    const createdByOnwer = true;

    // Get the customer and employee IDs associated with the provided usernames and owner ID
    const customerId = await getCustomerIdForOwner(ownerId, customer_username);

    if (!customerId) {
      return res
        .status(401)
        .json({ error_message: "Error finding the customer" });
    }

    const queryText = `INSERT INTO support_tickets (owner_id, customer_id, ticket_title, ticket_message, is_urgent, created_by_owner) 
      VALUES($1, $2, $3, $4, $5)`;

    const result = await pool.query(queryText, [
      ownerId,
      customerId,
      ticket_title,
      ticket_message,
      is_urgent,
      createdByOnwer,
    ]);

    if (result.rows.length > 0) {
      res.status(201).json({
        ticket_id: result.rows[0].ticket_id,
        message: "Support ticket created successfully!",
      });
    } else {
      res
        .status(500)
        .json({ error_message: "Failed to create support ticket" });
    }
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updateSupportTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const ticketId = req.params.id;
    const {
      customer_username,
      ticket_title,
      ticket_message,
      is_urgent,
      is_closed,
    } = req.body;

    // Get the customer and employee IDs associated with the provided usernames and owner ID
    const customerId = await getCustomerIdForOwner(ownerId, customer_username);

    if (!customerId) {
      return res
        .status(401)
        .json({ error_message: "Error finding the customer or employee" });
    }

    // Check if the support ticket exists and is owned by the provided owner
    const ticketExistsQuery =
      "SELECT * FROM support_tickets WHERE ticket_id = $1 AND owner_id = $2";
    const ticketExistsResult = await pool.query(ticketExistsQuery, [
      ticketId,
      ownerId,
    ]);

    if (ticketExistsResult.rows.length === 0) {
      return res.status(404).json({
        error_message: "No support ticket found with the provided ID",
      });
    }

    const existingTicket = ticketExistsResult.rows[0];

    // Determine the values to update
    const updatedValues = {
      customer_id: customerId || existingTicket.customer_id,
      ticket_title: ticket_title || existingTicket.ticket_title,
      ticket_message: ticket_message || existingTicket.ticket_message,
      is_urgent: is_urgent || existingTicket.is_urgent,
      is_closed: is_closed || existingTicket.is_closed,
    };

    // Update the support ticket
    const updateQuery = {
      text: `
        UPDATE support_tickets
        SET customer_id = $1, ticket_title = $2, ticket_message = $3, is_urgent = $4, is_closed = $5
        WHERE ticket_id = $6 AND owner_id = $7
        RETURNING ticket_id`,
      values: [
        updatedValues.customer_id,
        updatedValues.ticket_title,
        updatedValues.ticket_message,
        updatedValues.is_urgent,
        updatedValues.is_closed,
        ticketId,
        ownerId,
      ],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rowCount > 0) {
      res.status(200).json({
        ticket_id: updateResult.rows[0].ticket_id,
        message: "Support ticket updated successfully!",
      });
    } else {
      res
        .status(500)
        .json({ error_message: "Failed to update support ticket" });
    }
  } catch (error) {
    console.error("Error updating support ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteSupportTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const ticketId = req.params.id;

    // Check if the support ticket exists and is owned by the provided owner
    const ticketExistsQuery =
      "SELECT * FROM support_tickets WHERE ticket_id = $1 AND owner_id = $2";
    const ticketExistsResult = await pool.query(ticketExistsQuery, [
      ticketId,
      ownerId,
    ]);

    if (ticketExistsResult.rows.length === 0) {
      return res.status(404).json({
        error_message: "No support ticket found with the provided ID",
      });
    }

    // Proceed with deleting the support ticket
    const deleteQuery = {
      text: "DELETE FROM support_tickets WHERE ticket_id = $1 AND owner_id = $2",
      values: [ticketId, ownerId],
    };

    const deleteResult = await pool.query(deleteQuery);

    if (deleteResult.rowCount > 0) {
      res.status(202).json({ message: "Support ticket deleted successfully" });
    } else {
      res
        .status(500)
        .json({ error_message: "Failed to delete support ticket" });
    }
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getSupportTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const ticketId = req.params.id;

    // Check if the support ticket exists and is owned by the provided owner
    const ticketQuery =
      "SELECT * FROM support_tickets WHERE ticket_id = $1 AND owner_id = $2";
    const ticketResult = await pool.query(ticketQuery, [ticketId, ownerId]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        error_message: "No support ticket found with the provided ID",
      });
    }

    const supportTicket = ticketResult.rows[0];

    res.status(200).json({ support_ticket: supportTicket });
  } catch (error) {
    console.error("Error retrieving support ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllSupportTickets = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // Retrieve all support tickets for the provided owner
    const ticketsQuery = "SELECT * FROM support_tickets WHERE owner_id = $1";
    const ticketsResult = await pool.query(ticketsQuery, [ownerId]);

    const supportTicketList = ticketsResult.rows;

    res.status(200).json({ support_ticket_list: supportTicketList });
  } catch (error) {
    console.error("Error retrieving all support tickets:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllOpenTickets = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // Retrieve all open support tickets for the provided owner
    const openTicketsQuery =
      "SELECT * FROM support_tickets WHERE owner_id = $1 AND is_closed = false";
    const openTicketsResult = await pool.query(openTicketsQuery, [ownerId]);

    const openTicketsList = openTicketsResult.rows;

    res.status(200).json({ open_tickets_list: openTicketsList });
  } catch (error) {
    console.error("Error retrieving all open support tickets:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllClosedTickets = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // Retrieve all closed support tickets for the provided owner
    const closedTicketsQuery =
      "SELECT * FROM support_tickets WHERE owner_id = $1 AND is_closed = true";
    const closedTicketsResult = await pool.query(closedTicketsQuery, [ownerId]);

    const closedTicketsList = closedTicketsResult.rows;

    res.status(200).json({ closed_tickets_list: closedTicketsList });
  } catch (error) {
    console.error("Error retrieving all closed support tickets:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const closeSupportTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const ticketId = req.params.id;

    // Check if the support ticket exists and is owned by the provided owner
    const ticketExistsQuery =
      "SELECT * FROM support_tickets WHERE ticket_id = $1 AND owner_id = $2";
    const ticketExistsResult = await pool.query(ticketExistsQuery, [
      ticketId,
      ownerId,
    ]);

    if (ticketExistsResult.rows.length === 0) {
      return res.status(404).json({
        error_message: "No support ticket found with the provided ID",
      });
    }

    // Proceed with closing the support ticket
    const closeQuery = {
      text: `
        UPDATE support_tickets
        SET is_closed = true
        WHERE ticket_id = $1 AND owner_id = $2
        RETURNING ticket_id`,
      values: [ticketId, ownerId],
    };

    const closeResult = await pool.query(closeQuery);

    if (closeResult.rowCount > 0) {
      res.status(200).json({
        ticket_id: closeResult.rows[0].ticket_id,
        message: "Support ticket closed successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to close support ticket" });
    }
  } catch (error) {
    console.error("Error closing support ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllTicketReplies = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const ticketId = req.params.id;

    const repliesQuery = `
      SELECT 
        reply_id, ticket_id, owner_id, customer_id, reply_text, created_at, issentbyowner
      FROM support_tickets_replies 
      WHERE owner_id = $1 AND ticket_id = $2
    `;

    const repliesResult = await pool.query(repliesQuery, [ownerId, ticketId]);

    const repliesList = repliesResult.rows.map((reply) => ({
      ...reply,
      user_type: reply.issentbyowner ? "owner" : "customer",
    }));

    res.status(200).json({ replies_list: repliesList });
  } catch (error) {
    console.error("Error retrieving all replies for the ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createReply = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const ticketId = req.params.id;
    const { replyText } = req.body;
    const isSentByOwner = true;
    const customerId = (
      await pool.query(
        "SELECT customer_id FROM support_tickets WHERE ticket_id=$1",
        [ticketId]
      )
    ).rows[0].customer_id;

    // Check if the ticket is closed
    const isTicketClosedResult = await pool.query(
      "SELECT is_closed FROM support_tickets WHERE ticket_id = $1",
      [ticketId]
    );

    if (
      isTicketClosedResult.rows.length > 0 &&
      isTicketClosedResult.rows[0].is_closed
    ) {
      return res.status(403).json({ error_message: "Ticket is closed" });
    }

    if (!customerId) {
      return res
        .status(401)
        .json({ error_message: "Error finding the customer" });
    }

    const queryText = `
      INSERT INTO support_tickets_replies (ticket_id, owner_id, customer_id, reply_text, issentbyowner) 
      VALUES($1, $2, $3, $4, $5)
      RETURNING reply_id, created_at
    `;

    const result = await pool.query(queryText, [
      ticketId,
      ownerId,
      customerId,
      replyText,
      isSentByOwner,
    ]);

    if (result.rows.length > 0) {
      const { reply_id, created_at } = result.rows[0];
      const userType = isSentByOwner ? "owner" : "customer";
      res.status(201).json({
        replyId: reply_id,
        userType: userType,
        createdAt: created_at,
        message: "Reply created successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to create reply" });
    }
  } catch (error) {
    console.error("Error creating reply:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createAlertTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { alert_type, alert_message } = req.body;

    const queryText = `INSERT INTO alerts (owner_id,  alert_type, alert_message, is_assigned, is_closed, user_type,created_by) 
      VALUES($1, $2, $3, false, false,owner,$4)`;

    const result = await pool.query(queryText, [
      ownerId,
      alert_type,
      alert_message,
      ownerId,
    ]);

    if (result.rows.length > 0) {
      res.status(201).json({
        alertId: result.rows[0].alert_id,
        message: "Alert ticket created successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to create alert ticket" });
    }
  } catch (error) {
    console.error("Error creating alert ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const updateAlertTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const alertId = req.params.id;
    const { alert_type, alert_message } = req.body;

    // Check if the alert ticket exists and is owned by the provided owner
    const alertExistsQuery =
      "SELECT * FROM alerts WHERE alert_id = $1 AND owner_id = $2";
    const alertExistsResult = await pool.query(alertExistsQuery, [
      alertId,
      ownerId,
    ]);

    if (alertExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No alert ticket found with the provided ID" });
    }

    // Determine the values to update
    const updatedValues = {
      alert_type: alert_type || existingAlert.alert_type,
      alert_message: alert_message || existingAlert.alert_message,
    };

    // Update the alert ticket
    const updateQuery = {
      text: `
        UPDATE alerts
        SET alert_type = $1, alert_message = $2
        WHERE alert_id = $5 AND owner_id = $6
        RETURNING alert_id`,
      values: [
        updatedValues.alert_type,
        updatedValues.alert_message,
        alertId,
        ownerId,
      ],
    };

    const updateResult = await pool.query(updateQuery);

    if (updateResult.rowCount > 0) {
      res.status(200).json({
        alert_id: updateResult.rows[0].alert_id,
        message: "Alert ticket updated successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to update alert ticket" });
    }
  } catch (error) {
    console.error("Error updating alert ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const deleteAlertTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const alertId = req.params.id;

    // Check if the alert ticket exists and is owned by the provided owner
    const alertExistsQuery =
      "SELECT * FROM alerts WHERE alert_id = $1 AND owner_id = $2";
    const alertExistsResult = await pool.query(alertExistsQuery, [
      alertId,
      ownerId,
    ]);

    if (alertExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No alert ticket found with the provided ID" });
    }

    // Proceed with deleting the alert ticket
    const deleteQuery = {
      text: "DELETE FROM alerts WHERE alert_id = $1 AND owner_id = $2",
      values: [alertId, ownerId],
    };

    const deleteResult = await pool.query(deleteQuery);

    if (deleteResult.rowCount > 0) {
      res.status(202).json({ message: "Alert ticket deleted successfully" });
    } else {
      res.status(500).json({ error_message: "Failed to delete alert ticket" });
    }
  } catch (error) {
    console.error("Error deleting alert ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAlertTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const alertId = req.params.id;

    // Check if the alert ticket exists and is owned by the provided owner
    const alertQuery =
      "SELECT * FROM alerts WHERE alert_id = $1 AND owner_id = $2";
    const alertResult = await pool.query(alertQuery, [alertId, ownerId]);

    if (alertResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No alert ticket found with the provided ID" });
    }

    const alertTicket = alertResult.rows[0];

    res.status(200).json({ alert_ticket: alertTicket });
  } catch (error) {
    console.error("Error retrieving alert ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllAlertTickets = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // Retrieve all alert tickets for the provided owner
    const alertsQuery = "SELECT * FROM alerts WHERE owner_id = $1";
    const alertsResult = await pool.query(alertsQuery, [ownerId]);

    const alertTicketList = alertsResult.rows;

    res.status(200).json({ alert_ticket_list: alertTicketList });
  } catch (error) {
    console.error("Error retrieving all alert tickets:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllOpenAlerts = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // Retrieve all open alert tickets for the provided owner
    const openAlertsQuery =
      "SELECT * FROM alerts WHERE owner_id = $1 AND is_closed = false";
    const openAlertsResult = await pool.query(openAlertsQuery, [ownerId]);

    const openAlertsList = openAlertsResult.rows;

    res.status(200).json({ open_alerts_list: openAlertsList });
  } catch (error) {
    console.error("Error retrieving all open alert tickets:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllClosedAlerts = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // Retrieve all closed alert tickets for the provided owner
    const closedAlertsQuery =
      "SELECT * FROM alert_tickets WHERE owner_id = $1 AND is_closed = true";
    const closedAlertsResult = await pool.query(closedAlertsQuery, [ownerId]);

    const closedAlertsList = closedAlertsResult.rows;

    res.status(200).json({ closed_alerts_list: closedAlertsList });
  } catch (error) {
    console.error("Error retrieving all closed alert tickets:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const closeAlertTicket = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const alertId = req.params.id;

    // Check if the alert ticket exists and is owned by the provided owner
    const alertExistsQuery =
      "SELECT * FROM alerts WHERE alert_id = $1 AND owner_id = $2";
    const alertExistsResult = await pool.query(alertExistsQuery, [
      alertId,
      ownerId,
    ]);

    if (alertExistsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No alert ticket found with the provided ID" });
    }

    // Proceed with closing the alert ticket
    const closeQuery = {
      text: `
        UPDATE alerts
        SET is_closed = true
        WHERE alert_id = $1 AND owner_id = $2
        RETURNING alert_id`,
      values: [alertId, ownerId],
    };

    const closeResult = await pool.query(closeQuery);

    if (closeResult.rowCount > 0) {
      res.status(200).json({
        alert_id: closeResult.rows[0].alert_id,
        message: "Alert ticket closed successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to close alert ticket" });
    }
  } catch (error) {
    console.error("Error closing alert ticket:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllAlertReplies = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const alertId = req.params.id;

    const repliesQuery = `
      SELECT 
        reply_id, alert_id, owner_id, employee_id, reply_text, isSentByOwner
      FROM alert_replies 
      WHERE owner_id = $1 AND alert_id = $2
    `;

    const repliesResult = await pool.query(repliesQuery, [ownerId, alertId]);

    const repliesList = repliesResult.rows.map((reply) => ({
      ...reply,
      user_type: reply.issentbyowner ? "owner" : "employee",
    }));

    res.status(200).json({ replies_list: repliesList });
  } catch (error) {
    console.error("Error retrieving all replies for the alert:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createAlertReply = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const alertId = req.params.id;
    const isSentByOwner = true;
    const { replyText } = req.body;

    const isAlertClosedResult = await pool.query(
      "SELECT is_closed FROM alerts WHERE ticket_id = $1",
      [alertId]
    );

    if (
      isAlertClosedResult.rows.length > 0 &&
      isAlertClosedResult.rows[0].is_closed
    ) {
      return res.status(403).json({ error_message: "Ticket is closed" });
    }

    const queryText = `
      INSERT INTO alert_replies (alert_id, owner_id,reply_text, issentbyowner) 
      VALUES($1, $2, $3, $4)
      RETURNING reply_id, created_at
    `;

    const result = await pool.query(queryText, [
      alertId,
      ownerId,
      replyText,
      isSentByOwner,
    ]);

    if (result.rows.length > 0) {
      const { reply_id, created_at } = result.rows[0];
      const userType = isSentByOwner ? "owner" : "employee";
      res.status(201).json({
        replyId: reply_id,
        userType: userType,
        createdAt: created_at,
        message: "Reply created successfully!",
      });
    } else {
      res.status(500).json({ error_message: "Failed to create reply" });
    }
  } catch (error) {
    console.error("Error creating alert reply:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

module.exports = {
  ownerSignUp,
  getCustomersList,
  getEmployeeList,
  createCustomerAccount,
  getEquipments,
  createEquipment,
  ownerUpdate,
  updateCustomerAccount,
  createEmployeeAccount,
  deleteCustomer,
  deleteEmployee,
  updateEmployeeAccount,
  updateEquipment,
  deleteEquipment,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getKwhPrice,
  createPrice,
  updatePrice,
  deletePrice,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getElectricSchedule,
  createElectricSchedule,
  updateElectricSchedule,
  deleteElectricSchedule,
  getAllBills,
  getCustomerBill,
  createBill,
  updateBill,
  deleteBill,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getAllSupportTickets,
  getSupportTicket,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
  closeSupportTicket,
  getAllOpenTickets,
  getAllClosedTickets,
  createAlertTicket,
  updateAlertTicket,
  deleteAlertTicket,
  getAlertTicket,
  getAllAlertTickets,
  closeAlertTicket,
  getAllOpenAlerts,
  getAllClosedAlerts,
  getAllTicketReplies,
  createReply,
  getAllAlertReplies,
  createAlertReply,
};
