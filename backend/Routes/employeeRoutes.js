const { Router } = require("express");
const { authenticateEmployeeToken } = require("../middleware/employeeAuth");
const {
  updateProfile,
  getCustomerListEmployee,
  createCustomerAccountEmployee,
  updateCustomerAccountEmployee,
  getAllBillsEmp,
  getCustomerBillEmp,
  createBillEmp,
  updateBillEmp,
  deleteCustomerEmp,
  getAllOpenAlertsEmp,
  getAlertTicketEmp,
  createAlertReplyEmp,
  getAllAlertRepliesEmp,
  createAlertTicketEmp,
  getAnnouncementsEmp,
  getElectricScheduleEmp,
  getKwhPriceEmp,
} = require("../controllers/Employee");
const router = Router();

module.exports = function (io) {
  router.use(authenticateEmployeeToken, (req, res, next) => {
    // Join the room when the request is authenticated
    io.on("connection", (socket) => {
      const room1 = `all${req.user.ownerId}`;
      socket.join(room1);
      const room2 = `emp${req.user.ownerId}`;
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

  //update profile:
  router.put("/profile", authenticateEmployeeToken, updateProfile);

  //customers
  router.get("/customers", authenticateEmployeeToken, getCustomerListEmployee);
  router.post(
    "/customers",
    authenticateEmployeeToken,
    createCustomerAccountEmployee
  );
  router.put(
    "/customers/:username",
    authenticateEmployeeToken,
    updateCustomerAccountEmployee
  );
  router.delete(
    "/customers/:username",
    authenticateEmployeeToken,
    deleteCustomerEmp
  );

  //bills
  router.get("/bills", authenticateEmployeeToken, getAllBillsEmp);
  router.get("/bills/:username", authenticateEmployeeToken, getCustomerBillEmp);
  router.post("/bills", authenticateEmployeeToken, createBillEmp);
  router.put("/bills/:id", authenticateEmployeeToken, updateBillEmp);

  //Price
  router.get("/price", authenticateEmployeeToken, getKwhPriceEmp);

  //alerts
  router.get("/issues/open", authenticateEmployeeToken, getAllOpenAlertsEmp);
  router.get("/issues/:id", authenticateEmployeeToken, getAlertTicketEmp);
  router.post("/issues", authenticateEmployeeToken, createAlertTicketEmp);

  //alert replies
  router.post(
    "/issue/:id/reply/",
    authenticateEmployeeToken,
    createAlertReplyEmp
  );
  router.get(
    "/issue/:id/reply/",
    authenticateEmployeeToken,
    getAllAlertRepliesEmp
  );

  //Announcements
  router.get("/announcements", authenticateEmployeeToken, getAnnouncementsEmp);

  //Electric schedule
  router.get(
    "/electric-schedule",
    authenticateEmployeeToken,
    getElectricScheduleEmp
  );

  return router;
};
