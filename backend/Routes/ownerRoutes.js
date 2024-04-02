const { Router } = require("express");
const {
  ownerSignUp,
  getCustomersList,
  getEmployeeList,
  createCustomerAccount,
  createEquipment,
  getEquipments,
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
  closeSupportTicket,
  getAllOpenTickets,
  getAllClosedTickets,
  getAllAlertTickets,
  getAllOpenAlerts,
  getAllClosedAlerts,
  updateAlertTicket,
  closeAlertTicket,
  createAlertTicket,
  deleteAlertTicket,
  getAlertTicket,
  getAllTicketReplies,
  createReply,
  createAlertReply,
  getAllAlertReplies,
  deleteSupportTicket,
  getKwhPrice,
  updatePrice,
  deletePrice,
  getExpensesOfEmp,
  startBilling,
  stopBilling,
  getPreviousMeter,
  calculateBill,
  checkActiveBillingCycle,
  calculateProfit,
} = require("../controllers/Owners");
const { authenticateOwnerToken } = require("../middleware/ownerAuth");
const router = Router();

module.exports = function (io) {
  
  router.post("/signup", ownerSignUp);

  router.use(authenticateOwnerToken, (req, res, next) => {
    // Join the room when the request is authenticated
    io.on("connection", (socket) => {
      const room1 = `all${req.user.userId}`;
      socket.join(room1);
      const room2 = `emp${req.user.userId}`;
      socket.join(room2);
      const room3 = `cust${req.user.userId}`;
      socket.join(room3);
      console.log("joined room", room1, room2, room3);

      // Handle socket disconnection
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        socket.leave(room1); // Leave the room when disconnected
        socket.leave(room2); // Leave the room when disconnected
        socket.leave(room3); // Leave the room when disconnected
      });
    });
    next(); // Call the next middleware in the chain
  });

  router.put("/profile", authenticateOwnerToken, ownerUpdate);

  //customers
  router.get("/customers", authenticateOwnerToken, getCustomersList);
  router.post("/customers", authenticateOwnerToken, createCustomerAccount);
  router.put(
    "/customers/:username",
    authenticateOwnerToken,
    updateCustomerAccount
  );
  router.delete("/customers/:username", authenticateOwnerToken, deleteCustomer);

  //employees
  router.get("/employees", authenticateOwnerToken, getEmployeeList);
  router.post("/employees", authenticateOwnerToken, createEmployeeAccount);
  router.put(
    "/employees/:username",
    authenticateOwnerToken,
    updateEmployeeAccount
  );
  router.delete("/employees/:username", authenticateOwnerToken, deleteEmployee);

  //equipments
  router.get("/equipments", authenticateOwnerToken, getEquipments);
  router.post("/equipments", authenticateOwnerToken, createEquipment);
  router.put("/equipment/:name", authenticateOwnerToken, updateEquipment);
  router.delete("/equipment/:name", authenticateOwnerToken, deleteEquipment);

  //announcements
  router.get("/announcements", authenticateOwnerToken, getAnnouncements);
  router.post("/announcements", authenticateOwnerToken, createAnnouncement);
  router.delete(
    "/announcements/:id",
    authenticateOwnerToken,
    deleteAnnouncement
  );

  //Kwh_prices
  router.get("/price", authenticateOwnerToken, getKwhPrice);
  router.put("/price/", authenticateOwnerToken, updatePrice);
  router.delete("/price/:id", authenticateOwnerToken, deletePrice);

  //subscription plan
  router.get("/plans", authenticateOwnerToken, getPlans);
  router.post("/plans", authenticateOwnerToken, createPlan);
  router.put("/plans/:id", authenticateOwnerToken, updatePlan);
  router.delete("/plans/:id", authenticateOwnerToken, deletePlan);

  //electric schedule
  router.get("/electric-schedule", authenticateOwnerToken, getElectricSchedule);
  router.post(
    "/electric-schedule",
    authenticateOwnerToken,
    createElectricSchedule
  );
  router.put(
    "/electric-schedule/",
    authenticateOwnerToken,
    updateElectricSchedule
  );
  router.delete(
    "/electric-schedule/:id",
    authenticateOwnerToken,
    deleteElectricSchedule
  );

  //Bills
  router.get("/bills", authenticateOwnerToken, getAllBills);
  router.get("/bills/:id", authenticateOwnerToken, getCustomerBill);
  //the Id is for the customer here
  router.post("/bills/:id", authenticateOwnerToken, createBill);
  //the id is for the bill here
  router.put("/bills/:id", authenticateOwnerToken, updateBill);
  router.delete("/bills/:id", authenticateOwnerToken, deleteBill);

  //Billing cycle
  router.get("/billing-cycle", authenticateOwnerToken, checkActiveBillingCycle);
  router.post("/billing-cycle/start", authenticateOwnerToken, startBilling);
  router.post("/billing-cycle/stop", authenticateOwnerToken, stopBilling);

  //Previous Meter;
  router.get("/previous-meter/:id", authenticateOwnerToken, getPreviousMeter);

  router.get("/profit", authenticateOwnerToken, calculateProfit);

  //calculate Bill
  router.post("/calculate-bill/:id", authenticateOwnerToken, calculateBill);

  //expenses
  router.get("/expenses", authenticateOwnerToken, getExpenses);

  //id is employeeId
  router.get("/expenses/:id", authenticateOwnerToken, getExpensesOfEmp);
  router.post("/expenses", authenticateOwnerToken, createExpense);
  router.put("/expenses/:id", authenticateOwnerToken, updateExpense);
  router.delete("/expenses/:id", authenticateOwnerToken, deleteExpense);

  //Support_tickets
  router.get("/tickets", authenticateOwnerToken, getAllSupportTickets);
  router.get("/ticket/open", authenticateOwnerToken, getAllOpenTickets);
  router.get("/ticket/close", authenticateOwnerToken, getAllClosedTickets);
  router.get("/ticket/:id", authenticateOwnerToken, getSupportTicket);
  router.post("/ticket", authenticateOwnerToken, createSupportTicket);
  router.put("/ticket/:id", authenticateOwnerToken, updateSupportTicket);
  router.put("/ticket/:id/close", authenticateOwnerToken, closeSupportTicket);
  router.delete("/ticket/:id", authenticateOwnerToken, deleteSupportTicket);

  //Support tickets replies
  router.get("/ticket/:id/reply", authenticateOwnerToken, getAllTicketReplies);
  router.post("/ticket/:id/reply", authenticateOwnerToken, createReply);

  //alert ticket
  router.get("/issues", authenticateOwnerToken, getAllAlertTickets);
  router.get("/issues/:id", authenticateOwnerToken, getAlertTicket);
  router.get("/issues/open", authenticateOwnerToken, getAllOpenAlerts);
  router.get("/issues/close", authenticateOwnerToken, getAllClosedAlerts);
  router.put("/issues/:id", authenticateOwnerToken, updateAlertTicket);
  router.put("/issues/:id/close", authenticateOwnerToken, closeAlertTicket);
  router.post("/issues", authenticateOwnerToken, createAlertTicket);
  router.delete("/issues/:id", authenticateOwnerToken, deleteAlertTicket);

  //alert replies
  router.post("/issue/:id/reply", authenticateOwnerToken, createAlertReply);
  router.get("/issue/:id/reply", authenticateOwnerToken, getAllAlertReplies);

  return router;
};
