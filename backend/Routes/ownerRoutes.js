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
} = require("../controllers/Owners");
const { authenticateOwnerToken } = require("../middleware/ownerAuth");
const router = Router();

module.exports = function (io) {

  // router.use(authenticateOwnerToken, (req, res, next) => {
    
  //   io.on("connection", (socket) => {
  //     socket.join(`ann${req.user.userId}`);
  //     console.log('joined room');
  //   });
  //   next(); 
  // });

  router.post("/signup", ownerSignUp);
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
    "/electric-schedule/:id",
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
  router.get("/bills/:username", authenticateOwnerToken, getCustomerBill);
  router.post("/bills", authenticateOwnerToken, createBill);
  router.put("/bills/:id", authenticateOwnerToken, updateBill);
  router.delete("/bills/:id", authenticateOwnerToken, deleteBill);

  //expenses
  router.get("/expenses", authenticateOwnerToken, getExpenses);
  router.post("/expenses", authenticateOwnerToken, createExpense);
  router.put("/expenses/:id", authenticateOwnerToken, updateExpense);
  router.delete("/expenses/:id", authenticateOwnerToken, deleteExpense);

  //Support_tickets
  router.get("/ticket", authenticateOwnerToken, getAllSupportTickets);
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
