const pool = require("../db");
const { generateCustomerToken } = require("../utils/JWT");
const bcrypt = require("bcrypt");

const updateProfileCustomer = async (req, res) => {
  try {
    const customerId = req.user.userId; // Updated variable name
    const ownerId = req.user.ownerId;
    const { userName, password } = req.body;

    // Check if the employee exists
    const customerExists = await pool.query(
      "SELECT * FROM customers WHERE customer_id = $1",
      [customerId]
    );

    if (customerExists.rows.length === 0) {
      return res
        .status(404)
        .json({ error_message: "No customer found with ID: " + customerId });
    }

    const existingCustomer = customerExists.rows[0];

    const updatedUserName = userName || existingCustomer.username;
    const updatedPassword = password
      ? await bcrypt.hash(password, 10)
      : existingCustomer.password_hash;

    const updateQuery = {
      text: `
          UPDATE customers
          SET username = $1, password_hash = $2
          WHERE customer_id = $3
          RETURNING customer_id, username`,
      values: [
        updatedUserName,
        updatedPassword,
        customerId,
      ],
    };

    const results = await pool.query(updateQuery);

    if (results.rowCount > 0) {
      const newToken = await generateCustomerToken(
        customerId,
        ownerId,
        updatedUserName
      );
      return res
        .status(200)
        .json({ message: "Customer updated successfully", token: newToken });
    }

    return res
      .status(404)
      .json({ error_message: "No customer found with ID: " + employeeId });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getElectricScheduleCus = async (req, res) => {
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

const getAnnouncementsCus = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const queryText =
      "SELECT * FROM announcements WHERE owner_id = $1 AND (target_type = 'CUSTOMER' OR target_type = 'BOTH')";

    const announcementsResult = await pool.query(queryText, [ownerId]);

    if (announcementsResult.rows.length > 0) {
      res.status(200).json({ announcements: announcementsResult.rows });
    } else {
      res
        .status(404)
        .json({ error_message: "No announcements found for the customers" });
    }
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllCustomerBills = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const customerId = req.user.userId;

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
const getBillDetails = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const billId = req.params.id;

    const queryText =
      "SELECT * FROM bills WHERE owner_id = $1 AND bill_id = $2";
    const result = await pool.query(queryText, [ownerId, billId]);

    res.status(200).json({ bill: result.rows[0] });
  } catch (error) {
    console.error("Error fetching customer bill:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const getAllOpenTicketsCus = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const customerId = req.user.userId;

    // Retrieve all support tickets for the provided owner
    const ticketsQuery = `
      SELECT s.ticket_id, s.owner_id, s.customer_id, c.username AS customer_username, o.username AS owner_username, s.ticket_message,
             s.is_closed, s.created_at
      FROM support_tickets s
      JOIN owners o ON s.owner_id = o.owner_id
      JOIN customers c on c.owner_id = $1
      LEFT JOIN owners co ON s.owner_id = co.owner_id
      WHERE c.customer_id = $2
      ORDER BY s.created_at DESC
    `;
    const ticketsResult = await pool.query(ticketsQuery, [ownerId, customerId]);

    const supportTicketList = [];
    for (const ticket of ticketsResult.rows) {
      // Fetch replies for each ticket from both owners and customers
      const repliesQuery = `
        SELECT sr.reply_text, 
               CASE 
                 WHEN sr.isSentByOwner THEN o.username
                 ELSE c.username
               END AS sender_username
        FROM support_tickets_replies sr
        LEFT JOIN owners o ON sr.owner_id = o.owner_id
        LEFT JOIN customers c ON sr.customer_id = c.customer_id
        WHERE sr.ticket_id = $1
      `;
      const repliesResult = await pool.query(repliesQuery, [ticket.ticket_id]);
      const replies = repliesResult.rows.reverse();

      const supportTicket = {
        ticket_id: ticket.ticket_id,
        owner_id: ticket.owner_id,
        customer_id: customerId,
        created_by: req.user.username,
        owner_username: ticket.owner_username,
        ticket_message: ticket.ticket_message,
        is_closed: ticket.is_closed,
        created_at: ticket.created_at,
        replies: replies.reverse(), // Reverse the order of replies to match the structure
      };
      supportTicketList.push(supportTicket);
    }

    res.status(200).json({ support_ticket_list: supportTicketList });
  } catch (error) {
    console.error("Error retrieving all support tickets:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const createSupportTicketCus = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const customerId = req.user.userId;
    const { ticket_message } = req.body;

    const is_urgent = false;

    const queryText = `INSERT INTO support_tickets (owner_id, customer_id, ticket_message, is_urgent) 
        VALUES($1, $2, $3, $4) RETURNING *`;

    const result = await pool.query(queryText, [
      ownerId,
      customerId,
      ticket_message,
      is_urgent,
    ]);

    if (result.rows.length > 0) {
      let room = `cust${ownerId}`;
      req.app
        .get("io")
        .to(room)
        .emit("newTicket", { ticketId: result.rows.ticket_id });
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

const closeSupportTicketCus = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const ownerId = req.user.ownerId;
    const ticketId = req.params.id;

    // Check if the support ticket exists and is owned by the provided customer
    const ticketExistsQuery =
      "SELECT * FROM support_tickets WHERE ticket_id = $1 AND customer_id = $2";
    const ticketExistsResult = await pool.query(ticketExistsQuery, [
      ticketId,
      customerId,
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
          WHERE ticket_id = $1 AND customer_id = $2
          RETURNING ticket_id`,
      values: [ticketId, customerId],
    };

    const closeResult = await pool.query(closeQuery);

    if (closeResult.rowCount > 0) {
      let room = `cust${ownerId}`;
      req.app.get("io").to(room).emit("closeTicket", { ticket_id: ticketId });
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

const getKwhPriceCus = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const queryText = "SELECT * FROM kwh_prices  WHERE owner_id = $1";
    const results = await pool.query(queryText, [ownerId]);
    if (results.rows.length > 0) {
      res.status(200).json({ price: results.rows[0].kwh_price });
    } else {
      res.status(404).json({ error_message: "KWH price not found" });
    }
  } catch (error) {
    console.error("Error fetching price:", error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};

const fetchRemaining = async (req, res) => {
  try {
    const customerId = req.user.userId;

    const queryText = `
      SELECT remaining_amount 
      FROM bills 
      WHERE customer_id = $1 
      ORDER BY billing_date DESC 
      LIMIT 1
    `;

    const { rows } = await pool.query(queryText, [customerId]);

    if (rows.length > 0) {
      res.status(200).json({ remaining_amount: rows[0].remaining_amount });
    } else {
      res.status(404).json({ error_message: "No remaining amount found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error_message: "Internal Server Error" });
  }
};


const getAllTicketRepliesCus = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const ticketId = req.params.id;

    const repliesQuery = `
        SELECT 
          reply_id, ticket_id, owner_id, customer_id, reply_text, created_at, issentbyowner
        FROM support_tickets_replies 
        WHERE customer_id = $1 AND ticket_id = $2
      `;

    const repliesResult = await pool.query(repliesQuery, [
      customerId,
      ticketId,
    ]);

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

const createReplyCus = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const ticketId = req.params.id;
    const { replyText } = req.body;
    const isSentByOwner = false;
    const customerId = req.user.userId;

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

      let room = `cust${ownerId}`;
      req.app.get("io").to(room).emit("newTicketReply", { customerId });

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

module.exports = {
  updateProfileCustomer,
  getElectricScheduleCus,
  getAnnouncementsCus,
  getAllCustomerBills,
  getBillDetails,
  getAllOpenTicketsCus,
  createSupportTicketCus,
  closeSupportTicketCus,
  getAllTicketRepliesCus,
  createReplyCus,
  getKwhPriceCus,
  fetchRemaining,
};
