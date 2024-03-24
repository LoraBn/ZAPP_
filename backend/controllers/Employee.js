const pool = require("../db");
const { generateEmployeeToken } = require("../utils/JWT");
const bcrypt = require("bcrypt");
const io = require('../server');
const { getCustomerIdForOwner } = require("../utils/ownerUtils");

const updateProfile = async (req, res) => {
  try {
    const employeeId = req.user.userId; // Updated variable name
    const ownerId = req.user.ownerId;
    const { name, lastName, userName, password } = req.body;

    // Check if the employee exists
    const employeeExists = await pool.query(
      "SELECT * FROM employees WHERE employee_id = $1",
      [employeeId]
    );

    if (employeeExists.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No employee found with ID: " + employeeId });
    }

    const existingEmployee = employeeExists.rows[0];

    const updatedName = name || existingEmployee.name;
    const updatedLastName = lastName || existingEmployee.last_name;
    const updatedUserName = userName || existingEmployee.username;
    const updatedPassword = password
      ? await bcrypt.hash(password, 10)
      : existingEmployee.password_hash;

    const updateQuery = {
      text: `
        UPDATE employees
        SET name = $1, last_name = $2, username = $3, password_hash = $4
        WHERE employee_id = $5
        RETURNING employee_id, username`,
      values: [
        updatedName,
        updatedLastName,
        updatedUserName,
        updatedPassword,
        employeeId,
      ],
    };

    const results = await pool.query(updateQuery);

    if (results.rowCount > 0) {
      const newToken = await generateEmployeeToken(
        employeeId,
        ownerId,
        updatedUserName
      );
      return res
        .status(200)
        .json({ message: "Employee updated successfully", token: newToken });
    }

    return res
      .status(404)
      .json({ error_message: "No employee found with ID: " + employeeId });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};


const getCustomerListEmployee = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
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

const createCustomerAccountEmployee = async (req, res) => {
  try {
    const {
      name,
      lastName,
      userName,
      password,
      address,
      planName,
      equipementName,
      scheduleName,
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

    const ownerId = req.user.ownerId;
    const equipementResult = await pool.query(
      "SELECT * FROM equipments WHERE owner_id = $1 AND name = $2 RETURNING equipement_id",
      [ownerId, equipementName]
    );
    const planResult = await pool.query(
      "SELECT * FROM plans_prices WHERE plan_name = $1 RETURNING plan_id",
      [planName]
    );
    const electricScheduleResult = await pool.query(
      "SELECT * FROM electric_schedules WHERE owner_id = $1 AND schedule_name = $2 RETURNING schedule_id",
      [ownerId, scheduleName]
    );

    const equipementId = equipementResult.rows[0].equipement_id;
    const planId = planResult.rows[0].plan_id;
    const electricScheduleId = electricScheduleResult.rows[0].schedule_id;

    const hashedPass = await bcrypt.hash(password, 10);

    const queryText = `
          INSERT INTO customers(owner_id, name, last_name, username, password_hash, address, plan_id, equipement_id, schedule_id)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
        electricScheduleId,
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

const updateCustomerAccountEmployee = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const customerUsername = req.params.username;
    const {
      name,
      lastName,
      userName,
      password,
      address,
      planName,
      equipementName,
      scheduleName,
    } = req.body;

    // Check if the customer exists
    const customerExists = await pool.query(
      "SELECT * FROM customers WHERE username = $1 AND owner_id = $2",
      [customerUsername, ownerId]
    );

    if (customerExists.rows.length === 0) {
      return res.status(404).json({
        error_message: "No customer found with the provided username",
      });
    }

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
      schedule_id: scheduleName
        ? (
            await pool.query(
              "SELECT * FROM electric_schedules WHERE owner_id = $1 AND schedule_name = $2 RETURNING schedule_id",
              [ownerId, scheduleName]
            )
          ).rows[0].schedule_id
        : existingCustomer.schedule_id,
    };

    const updateQuery = {
      text: `
          UPDATE customers
          SET name = $1, last_name = $2, username = $3, password_hash = $4, address = $5, plan_id = $6, equipement_id = $7, schedule_id = $8
          WHERE username = $9 AND owner_id = $10
          RETURNING customer_id`,
      values: [
        updatedValues.name,
        updatedValues.last_name,
        updatedValues.username,
        updatedValues.password_hash,
        updatedValues.address,
        updatedValues.plan_id,
        updatedValues.equipement_id,
        updatedValues.schedule_id,
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

const deleteCustomerEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
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

const getAllBillsEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    const queryText = "SELECT * FROM bills WHERE owner_id = $1";
    const result = await pool.query(queryText, [ownerId]);

    res.status(200).json({ bills: result.rows });
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getCustomerBillEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
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

const createBillEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
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

const updateBillEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
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

const getAllOpenAlertsEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

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

const getAlertTicketEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
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

const createAlertTicketEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const { alert_type, alert_message } = req.body;

    const queryText = `INSERT INTO alerts (owner_id,  alert_type, alert_message, is_assigned, is_closed, user_type,created_by) 
        VALUES($1, $2, $3, false, false,employee,$4)`;

    const result = await pool.query(queryText, [
      ownerId,
      alert_type,
      alert_message,
      employeeId,
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

const createAlertReplyEmp = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const ownerId = req.user.ownerId;
    const alertId = req.params.id;
    const isSentByOwner = false;
    const { replyText } = req.body;

    // Get the employee ID associated with the provided username and owner ID

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
        INSERT INTO alert_replies (alert_id, owner_id, employee_id, reply_text, issentbyowner) 
        VALUES($1, $2, $3, $4, $5)
        RETURNING reply_id, created_at
      `;

    const result = await pool.query(queryText, [
      alertId,
      ownerId,
      employeeId,
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

const getAllAlertRepliesEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
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

const getAnnouncementsEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const queryText = "SELECT * FROM announcements WHERE owner_id = $1 AND (target_type = 'EMPLOYEE' OR target_type = 'BOTH')";

    const announcementsResult = await pool.query(queryText, [ownerId]);

    if (announcementsResult.rows.length > 0) {
      res.status(200).json({ announcements: announcementsResult.rows });
    } else {
      res
        .status(404)
        .json({ error_message: "No announcements found for the employee" });
    }
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getElectricScheduleEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const queryText = `SELECT * FROM electric_schedules WHERE owner_id = $1`;
    const schedule = await pool.query(queryText, [ownerId]);
    res.status(200).json({ schedule: schedule.rows });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

module.exports = {
  updateProfile,
  getCustomerListEmployee,
  createCustomerAccountEmployee,
  updateCustomerAccountEmployee,
  deleteCustomerEmp,
  getAllBillsEmp,
  getCustomerBillEmp,
  createBillEmp,
  updateBillEmp,
  getAllOpenAlertsEmp,
  getAlertTicketEmp,
  createAlertTicketEmp,
  createAlertReplyEmp,
  getAllAlertRepliesEmp,
  getAnnouncementsEmp,
  getElectricScheduleEmp
};