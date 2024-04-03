const { Router } = require("express");
const { authenticateCustomerToken } = require("../middleware/customerAuth");
const {
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
} = require("../controllers/customer");
const router = Router();

module.exports = function (io) {
  router.use(authenticateCustomerToken, (req, res, next) => {
    // Join the room when the request is authenticated
    io.on("connection", (socket) => {
      const room1 = `all${req.user.ownerId}`;
      socket.join(room1);
      const room2 = `cust${req.user.ownerId}`;
      socket.join(room2);
      console.log("joined room", room1, room2);

      // Handle socket disconnection
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        socket.leave(room1); // Leave the room when disconnected
        socket.leave(room2); // Leave the room when disconnected
      });
    });
    next(); // Call the next middleware in the chain
  });

  router.get("/", authenticateCustomerToken, (req, res) => {
    res.send("Hello", req.user.userType, req.user.username);
  });

  //update Profile
  router.put("/profile", authenticateCustomerToken, updateProfileCustomer);

  //Schedule
  router.get(
    "/electric-schedule",
    authenticateCustomerToken,
    getElectricScheduleCus
  );

  //Announcements
  router.get("/announcements", authenticateCustomerToken, getAnnouncementsCus);

  //bills
  router.get("/bills", authenticateCustomerToken, getAllCustomerBills);
  router.get("/bills/:id", authenticateCustomerToken, getBillDetails);

  //Price
  router.get("/price", authenticateCustomerToken, getKwhPriceCus);

  //Remaining Amount
  router.get('/remaining', authenticateCustomerToken, fetchRemaining)

  //Support Tickets
  router.get("/tickets", authenticateCustomerToken, getAllOpenTicketsCus);
  router.post("/ticket", authenticateCustomerToken, createSupportTicketCus);
  router.put(
    "/ticket/:id/close",
    authenticateCustomerToken,
    closeSupportTicketCus
  );

  //Support tickets replies
  router.get(
    "/ticket/:id/reply",
    authenticateCustomerToken,
    getAllTicketRepliesCus
  );
  router.post("/ticket/:id/reply", authenticateCustomerToken, createReplyCus);

  return router;
};
