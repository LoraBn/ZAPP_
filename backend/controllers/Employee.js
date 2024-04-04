const pool = require("../db");
const { generateEmployeeToken } = require("../utils/JWT");
const bcrypt = require("bcrypt");
const io = require("../server");
const { getCustomerIdForOwner } = require("../utils/ownerUtils");

const updateProfile = async (req, res) => {
  try {
    const employeeId = req.user.userId; // Updated variable name
    const ownerId = req.user.ownerId;
    const {username, password } = req.body;

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

    const updatedUserName = username || existingEmployee.username;
    const updatedPassword = password
      ? await bcrypt.hash(password, 10)
      : existingEmployee.password_hash;

    const updateQuery = {
      text: `
        UPDATE employees
        SET username = $1, password_hash = $2
        WHERE employee_id = $3
        RETURNING employee_id, username`,
      values: [
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
      username,
      password,
      address,
      planName,
      equipmentName,
    } = req.body;

    // Check if the username already exists
    const userExists = await pool.query(
      "SELECT * FROM customers WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ error_message: "Username is already taken" });
    }

    const ownerId = req.user.ownerId;
    const equipmentResult = await pool.query(
      "SELECT * FROM equipments WHERE owner_id = $1 AND name = $2",
      [ownerId, equipmentName]
    );
    const planResult = await pool.query(
      "SELECT * FROM plans_prices WHERE plan_name = $1",
      [planName]
    );

    if (planResult.rows.length === 0) {
      return res.status(405).json({ error_message: "Plan not found" });
    }

    const equipmentId = equipmentResult.rows[0].equipment_id;
    const planId = planResult.rows[0].plan_id;

    const hashedPass = await bcrypt.hash(password, 10);

    const queryText = `
      INSERT INTO customers(owner_id, name, last_name, username, password_hash, address, plan_id, equipment_id) 
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING customer_id`;

    const result = await pool.query(queryText, [
      ownerId,
      name,
      lastName,
      username,
      hashedPass,
      address,
      planId,
      equipmentId,
    ]);

    res.status(201).json({ user_info: { username, password } });
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
    const customerId = req.params.id;

    if (!customerId) {
      return res.status(404).json({ error_message: "Customer not found" });
    }

    // Your query to get the bill for the specified customer
    const queryText =
      "SELECT * FROM bills WHERE owner_id = $1 AND customer_id = $2 ORDER BY billing_date DESC";
    const result = await pool.query(queryText, [ownerId, customerId]);

    res.status(200).json({ bills: result.rows });
  } catch (error) {
    console.error("Error fetching customer bill:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getPreviousMeterEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const customerId = req.params.id; // corrected typo in variable name
    let previousMeter;
    const latestBillQuery = `
      SELECT current_meter
      FROM bills
      WHERE customer_id = $1
      ORDER BY billing_date DESC
      LIMIT 1
    `;
    const latestBillResult = await pool.query(latestBillQuery, [customerId]); // corrected typo in variable name

    if (latestBillResult.rows.length > 0) {
      previousMeter = latestBillResult.rows[0].current_meter;
    } else {
      previousMeter = null;
    }

    // You might want to send the previousMeter value in the response
    res.status(200).json({ previousMeter });
  } catch (error) {
    console.log(error);
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

const startBillingEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    // Insert a new billing cycle record
    const queryText = `
      INSERT INTO billing_cycle (owner_id, started_at) 
      VALUES ($1, CURRENT_TIMESTAMP) 
      RETURNING cycle_id`;
    const { rows } = await pool.query(queryText, [ownerId]);
    const cycleId = rows[0].cycle_id;

    // Update is_cycled to false for customers associated with this owner
    const updateCustomersQuery = `
      UPDATE customers
      SET is_cycled = false
      WHERE owner_id = $1`;
    await pool.query(updateCustomersQuery, [ownerId]);

    let room = `emp${ownerId}`;
    req.app.get("io").to(room).emit("refreshCycle", { cycleId, ownerId });

    res
      .status(200)
      .json({ cycleId, message: "Billing cycle started successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error_message: "Server Error" });
  }
};

// Stop billing controller
const stopBillingEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    // Update the end time of the latest billing cycle for the owner
    const updateQuery =
      "UPDATE billing_cycle SET ended_at = CURRENT_TIMESTAMP WHERE owner_id = $1 AND ended_at IS NULL RETURNING cycle_id";
    const { rows } = await pool.query(updateQuery, [ownerId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No active billing cycle found for this owner." });
    }

    const cycleId = rows[0].cycle_id;

    let room = `emp${ownerId}`;
    req.app.get("io").to(room).emit("refreshCycle", { cycleId, ownerId });

    res
      .status(200)
      .json({ cycleId, message: "Billing cycle stopped successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error_message: "Server Error" });
  }
};

const checkActiveBillingCycleEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    // Check if there is any active billing cycle for the owner
    const queryText = `
      SELECT cycle_id
      FROM billing_cycle
      WHERE owner_id = $1
      AND started_at <= CURRENT_TIMESTAMP
      AND (ended_at IS NULL OR ended_at >= CURRENT_TIMESTAMP)
      LIMIT 1`;
    const { rows } = await pool.query(queryText, [ownerId]);

    if (rows.length === 0) {
      return res
        .status(206)
        .json({ message: "No active billing cycle found for this owner." });
    }

    const cycleId = rows[0].cycle_id;

    res.status(200).json({ cycleId, message: "Active billing cycle found." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error_message: "Server Error" });
  }
};

const getKwhPriceEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const queryText = "SELECT * FROM kwh_prices WHERE owner_id = $1";
    const results = await pool.query(queryText, [ownerId]);
    if (results.rows.length > 0) {
      res.status(200).json({ price: results.rows[0].kwh_price });
    } else {
      res.status(404).json({ error_message: "Kwh price not found" });
    }
  } catch (error) {
    console.error("Error fetching kwh price:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const calculateBillEmp = async (req, res) => {
  try {
    const customerId = req.params.id;
    const ownerId = req.user.ownerId;
    const { current_meter } = req.body;

    const planQuery = `
      SELECT plan_price
      FROM plans_prices
      WHERE plan_id = (
        SELECT plan_id
        FROM customers
        WHERE customer_id = $1
      )
      AND owner_id = $2
    `;
    const planResult = await pool.query(planQuery, [customerId, ownerId]);

    if (planResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error_message: "Plan price not found for the customer" });
    }

    const planPrice = planResult.rows[0].plan_price;

    const kWhPriceQuery = `
      SELECT kwh_price
      FROM kwh_prices
      WHERE owner_id = $1
      ORDER BY date DESC
      LIMIT 1
    `;
    const kWhPriceResult = await pool.query(kWhPriceQuery, [ownerId]);

    if (kWhPriceResult.rows.length === 0) {
      return res.status(400).json({ error_message: "kWh price not found" });
    }

    const kWhPrice = kWhPriceResult.rows[0].kwh_price;

    let previousMeter;
    const latestBillQuery = `
      SELECT current_meter
      FROM bills
      WHERE customer_id = $1
      ORDER BY billing_date DESC
      LIMIT 1
    `;
    const latestBillResult = await pool.query(latestBillQuery, [customerId]);

    if (latestBillResult.rows.length > 0) {
      previousMeter = latestBillResult.rows[0].current_meter;
    } else {
      previousMeter = req.body.previous_meter;
    }

    const remainingAmountQuery = `
      SELECT remaining_amount
      FROM bills
      WHERE customer_id = $1 AND owner_id = $2
      ORDER BY billing_date DESC
      LIMIT 1
    `;
    const remainingAmountResult = await pool.query(remainingAmountQuery, [
      customerId,
      ownerId,
    ]);

    let remainingAmount = 0;
    if (remainingAmountResult.rows.length > 0) {
      remainingAmount = remainingAmountResult.rows[0].remaining_amount;
    }

    const total_kwh = current_meter - previousMeter;

    const total_amount_calculated =
      total_kwh * kWhPrice + planPrice + parseFloat(remainingAmount);

    res.status(201).json({
      bill_info: {
        total_kwh,
        plan_price: planPrice,
        kwh_price: kWhPrice,
        total_amount_calculated,
      },
      message: "Bill calculated successfully!",
    });
  } catch (error) {
    console.error("Error calculating bill:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createBillEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const customerId = req.params.id;
    const {
      current_meter,
      total_kwh,
      total_amount,
      amount_paid, // Added to retrieve from request body
    } = req.body;

    const activeCycleQuery = `
      SELECT cycle_id
      FROM billing_cycle
      WHERE owner_id = $1
      AND started_at <= CURRENT_TIMESTAMP
      AND (ended_at IS NULL OR ended_at >= CURRENT_TIMESTAMP)
    `;
    const activeCycleResult = await pool.query(activeCycleQuery, [ownerId]);
    if (activeCycleResult.rows.length === 0) {
      return res.status(400).json({
        error_message:
          "No active billing cycle found or current date is not within the cycle's time frame.",
      });
    }
    const cycleId = activeCycleResult.rows[0].cycle_id;

    const existingBillQuery = `
      SELECT COUNT(*) AS bill_count
      FROM bills
      WHERE customer_id = $1
      AND cycle_id = $2
    `;
    const existingBillResult = await pool.query(existingBillQuery, [
      customerId,
      cycleId,
    ]);
    if (existingBillResult.rows[0].bill_count > 0) {
      return res.status(400).json({
        error_message:
          "A bill already exists for the customer in the current billing cycle.",
      });
    }

    const remaining_amount = total_amount - amount_paid;
    const billing_status = remaining_amount > 0 ? "PARTIAL" : "PAID";

    const queryText = `
      INSERT INTO bills(customer_id, owner_id, previous_meter, current_meter, total_kwh, total_amount, billing_status, remaining_amount, billing_date, cycle_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9)
      RETURNING *
    `;

    const result = await pool.query(queryText, [
      customerId,
      ownerId,
      req.body.previous_meter,
      current_meter,
      total_kwh,
      total_amount,
      billing_status,
      remaining_amount,
      cycleId,
    ]);

    if (result.rows.length > 0) {
      const updateCustomerQuery = `
        UPDATE customers
        SET is_cycled = true
        WHERE customer_id = $1
      `;
      await pool.query(updateCustomerQuery, [customerId]);

      let room = `all${ownerId}`;
      req.app.get("io").to(room).emit("newBill", {
        customer_id: customerId,
        bill_info: result.rows[0],
      });
      res.status(201).json({
        bill_info: result.rows[0],
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

const getAllOpenAlertTickets = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    // Retrieve all alert tickets for the provided owner
    const alertsQuery = `
      SELECT a.alert_id, a.owner_id, o.username AS owner_username, a.alert_type, a.alert_message,
             a.is_closed, a.created_at, 
             CASE 
               WHEN a.user_type = 'owner' THEN co.username
               WHEN a.user_type = 'employee' THEN ce.username
             END AS created_by,
             EXISTS (SELECT 1 FROM assigned_alerts WHERE alert_id = a.alert_id) AS is_assigned
      FROM alerts a
      JOIN owners o ON a.owner_id = o.owner_id
      LEFT JOIN employees e ON a.created_by = e.employee_id
      LEFT JOIN owners co ON a.created_by = co.owner_id AND a.user_type = 'owner'
      LEFT JOIN employees ce ON a.created_by = ce.employee_id AND a.user_type = 'employee'
      WHERE a.owner_id = $1
      ORDER BY a.created_at DESC
    `;
    const alertsResult = await pool.query(alertsQuery, [ownerId]);

    const alertTicketList = [];
    for (const alert of alertsResult.rows) {
      // Fetch assigned employee usernames
      const assignedEmployeesQuery = `
        SELECT e.username
        FROM assigned_alerts aa
        JOIN employees e ON aa.employee_id = e.employee_id
        WHERE aa.alert_id = $1
      `;
      const assignedEmployeesResult = await pool.query(assignedEmployeesQuery, [alert.alert_id]);
      const assignedUsernames = assignedEmployeesResult.rows.map(row => row.username);

      // Fetch replies for each alert from both employees and owners
      const repliesQuery = `
        SELECT ar.reply_text, 
               CASE 
                 WHEN ar.isSentByOwner THEN o.username
                 ELSE e.username
               END AS sender_username
        FROM alert_replies ar
        LEFT JOIN owners o ON ar.owner_id = o.owner_id
        LEFT JOIN employees e ON ar.employee_id = e.employee_id
        WHERE ar.alert_id = $1
      `;
      const repliesResult = await pool.query(repliesQuery, [alert.alert_id]);
      const replies = repliesResult.rows;

      const alertTicket = {
        alert_id: alert.alert_id,
        owner_id: alert.owner_id,
        owner_username: alert.owner_username,
        alert_type: alert.alert_type,
        alert_message: alert.alert_message,
        is_assigned: alert.is_assigned,
        assigned_usernames: assignedUsernames, // Include assigned employee usernames
        is_closed: alert.is_closed,
        created_at: alert.created_at,
        created_by: alert.created_by,
        replies: replies.reverse(), // Reverse the order of replies to match the structure
      };
      alertTicketList.push(alertTicket);
    }

    res.status(200).json({ alert_ticket_list: alertTicketList });
  } catch (error) {
    console.error("Error retrieving all alert tickets:", error);
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
    const employeeId = req.user.userId;
    const ownerId = req.user.ownerId;
    const { alert_type, alert_message } = req.body;

    const queryText = `INSERT INTO alerts (owner_id, alert_type, alert_message, is_assigned, is_closed, user_type, created_by) 
      VALUES($1, $2, $3, false, false, 'owner', $4)
      RETURNING *`;

    const result = await pool.query(queryText, [
      ownerId,
      alert_type,
      alert_message,
      employeeId,
    ]);

    if (result.rows.length > 0) {
      const alertId = result.rows[0].alert_id;

      const createdAlert = {
        alert_id: alertId,
        owner_id: ownerId,
        owner_username: req.user.username,
        alert_type,
        alert_message,
        is_assigned: false,
        is_closed: false,
        created_at: result.rows[0].created_at,
        created_by: req.user.username,
        replies: [],
      };

      // Emit the created alert through socket
      let room = `emp${ownerId}`;
      req.app.get("io").to(room).emit("newIssue", createdAlert);
      res.status(201).json({
        alert_ticket: createdAlert,
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
    const ownerId = req.user.ownerId;
    const employeeId = req.user.userId;
    const alertId = req.params.id;
    const username = req.user.username;
    const isSentByOwner = false;
    const { replyText } = req.body;
    console.log(replyText);

    const isAlertClosedResult = await pool.query(
      "SELECT is_closed FROM alerts WHERE alert_id = $1",
      [alertId]
    );

    if (
      isAlertClosedResult.rows.length > 0 &&
      isAlertClosedResult.rows[0].is_closed
    ) {
      return res.status(403).json({ error_message: "Alert is closed" });
    }

    const queryText = `
      INSERT INTO alert_replies (alert_id, owner_id,employee_id, reply_text, issentbyowner) 
      VALUES($1, $2, $3, $4,$5)
      RETURNING reply_id
    `;

    const result = await pool.query(queryText, [
      alertId,
      ownerId,
      employeeId,
      replyText,
      isSentByOwner,
    ]);

    if (result.rows.length > 0) {
      const { reply_id } = result.rows[0];
      const userType = isSentByOwner ? "owner" : "employee";
      res.status(201).json({
        replyId: reply_id,
        userType: userType,
        message: "Reply created successfully!",
      });
      let room = `emp${ownerId}`;
      req.app
        .get("io")
        .to(room)
        .emit("newIssueReply", {
          alert_id: alertId,
          message: {
            sender_username: username,
            reply_text: replyText,
          },
        }); // Corrected line
    } else {
      res.status(500).json({ error_message: "Failed to create reply" });
    }
  } catch (error) {
    console.error("Error creating alert reply:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const closeAlertTicketEmp = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const alertId = req.params.id;

    // Check if alertId and employeeId are defined and valid
    if (!alertId || !employeeId) {
      return res
        .status(400)
        .json({ error_message: "Invalid alert ID or employee ID" });
    }

    // Check if the employee is assigned to the alert
    const assignmentCheckQuery = `
      SELECT 1 FROM assigned_alerts WHERE alert_id = $1 AND employee_id = $2
    `;
    const assignmentCheckResult = await pool.query(assignmentCheckQuery, [alertId, employeeId]);

    if (assignmentCheckResult.rows.length === 0) {
      return res
        .status(406)
        .json({ error_message: "Employee is not assigned to the alert" });
    }

    // Proceed with closing the alert ticket
    const closeQuery = {
      text: `
        UPDATE alerts
        SET is_closed = true
        WHERE alert_id = $1`,
      values: [alertId],
    };

    const closeResult = await pool.query(closeQuery);

    if (closeResult.rowCount > 0) {
      let room = `emp${employeeId}`;
      req.app.get("io").to(room).emit("closedIssue", { alert_id: alertId });
      res.status(200).json({
        alert_id: alertId,
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

const getAssignedTicketsEmp = async (req, res) => {
  try {
    const employeeId = req.user.userId;

    const query = `
      SELECT alerts.*
      FROM assigned_alerts
      JOIN alerts ON assigned_alerts.alert_id = alerts.alert_id
      WHERE assigned_alerts.employee_id = $1
      AND alerts.is_closed = false;
    `;

    // Assuming you have defined pool somewhere in your code
    const { rows } = await pool.query(query, [employeeId]);

    res.status(200).json({ assigned_alerts: rows });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};



const assignSelf = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const ownerId = req.user.ownerId;
    const alertId = req.params.id;

    // Check if the employee is already assigned to the alert
    const checkAssignmentQuery = `
      SELECT 1 FROM assigned_alerts WHERE alert_id = $1 AND employee_id = $2
    `;
    const checkResult = await pool.query(checkAssignmentQuery, [alertId, employeeId]);

    if (checkResult.rows.length > 0) {
      // Employee is already assigned to the alert, return an error response
      return res.status(400).json({ error_message: "Employee is already assigned to the alert" });
    }

    // If employee is not already assigned, proceed with the assignment
    const queryText = `INSERT INTO assigned_alerts(alert_id, employee_id) VALUES($1, $2)`;
    await pool.query(queryText, [alertId, employeeId]);

    // Update the alert status to indicate it has been assigned
    const updateAlertQuery = `UPDATE alerts SET is_assigned = true WHERE alert_id = $1 AND owner_id = $2`;
    await pool.query(updateAlertQuery, [alertId, ownerId]);

    res.status(203).json({ assignedTo: req.user.username });
  } catch (error) {
    console.error(error);
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
    const queryText =
      "SELECT * FROM announcements WHERE owner_id = $1 AND (target_type = 'EMPLOYEE' OR target_type = 'BOTH')";

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

const getEmployeeExpenses = async (req, res) => {
  try {
    const employeeId = req.user.userId;

    const queryText = `SELECT * FROM expenses WHERE employee_id = $1 ORDER BY expense_date`;

    const expenseResults = await pool.query(queryText, [employeeId]);

    if (expenseResults.rows) {
      res.status(200).json({ expenses: expenseResults.rows });
    } else {
      res.sendStatus(404).json({ expenses: "No Expenses Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getPlansEmp = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const queryText = "SELECT * FROM plans_prices WHERE owner_id = $1";
    const plans = await pool.query(queryText, [ownerId]);
    res.status(200).json({ plans: plans.rows });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getEquipmentsEmp = async (req, res) => {
  try {
    const queryText = "SELECT * FROM equipments WHERE owner_id = $1";
    const { ownerId } = req.user;
    pool.query(queryText, [ownerId], (err, results) => {
      if (err) throw err;
      res.status(200).json({ equipments: results.rows });
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error_message: error.message });
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
  startBillingEmp,
  assignSelf,
  stopBillingEmp,
  checkActiveBillingCycleEmp,
  calculateBillEmp,
  getPreviousMeterEmp,
  getAllOpenAlertTickets,
  getAlertTicketEmp,
  createAlertTicketEmp,
  createAlertReplyEmp,
  getAssignedTicketsEmp,
  getAllAlertRepliesEmp,
  getAnnouncementsEmp,
  getElectricScheduleEmp,
  getKwhPriceEmp,
  getEmployeeExpenses,
  closeAlertTicketEmp,
  getPlansEmp,
  getEquipmentsEmp,
};
