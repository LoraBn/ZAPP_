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
  createPlan,
  updatePlan,
  deletePlan,
  getElectricSchedule,
  updateElectricSchedule,
  getAllBills,
  getCustomerBill,
  createBill,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getAllSupportTickets,
  closeSupportTicket,
  getAllAlertTickets,
  closeAlertTicket,
  createAlertTicket,
  createReply,
  createAlertReply,
  getKwhPrice,
  updatePrice,
  getExpensesOfEmp,
  startBilling,
  stopBilling,
  getPreviousMeter,
  calculateBill,
  checkActiveBillingCycle,
  calculateProfit,
  getBillsAnalytics,
  getAssignedTickets,
  getPlans,
  deleteProfileAccount,
} = require("../controllers/Owners");
const { authenticateOwnerToken } = require("../middleware/ownerAuth");
const router = Router();

router.post("/signup", ownerSignUp);

router.put("/profile", authenticateOwnerToken, ownerUpdate);
router.delete('/profile', authenticateOwnerToken, deleteProfileAccount)

//customers
router.get("/customers", authenticateOwnerToken, getCustomersList);
router.post("/customers", authenticateOwnerToken, createCustomerAccount);
router.put(
  "/customers/:username",
  authenticateOwnerToken,
  updateCustomerAccount
);
router.delete("/customers/:id", authenticateOwnerToken, deleteCustomer);

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

//Kwh_prices
router.get("/price", authenticateOwnerToken, getKwhPrice);
router.put("/price/", authenticateOwnerToken, updatePrice);

//subscription plan
router.get("/plans", authenticateOwnerToken, getPlans);
router.post("/plans", authenticateOwnerToken, createPlan);
router.put("/plans/:id", authenticateOwnerToken, updatePlan);
router.delete("/plans/:id", authenticateOwnerToken, deletePlan);

//electric schedule
router.get("/electric-schedule", authenticateOwnerToken, getElectricSchedule);
router.put(
  "/electric-schedule/",
  authenticateOwnerToken,
  updateElectricSchedule
);

//Bills
router.get("/bills", authenticateOwnerToken, getAllBills);
router.get("/bills/:id", authenticateOwnerToken, getCustomerBill);
//the Id is for the customer here
router.post("/bills/:id", authenticateOwnerToken, createBill);

//calculate Bill
router.post("/calculate-bill/:id", authenticateOwnerToken, calculateBill);

//Billing cycle
router.get("/billing-cycle", authenticateOwnerToken, checkActiveBillingCycle);
router.post("/billing-cycle/start", authenticateOwnerToken, startBilling);
router.post("/billing-cycle/stop", authenticateOwnerToken, stopBilling);

//Previous Meter;
router.get("/previous-meter/:id", authenticateOwnerToken, getPreviousMeter);

router.get("/profit", authenticateOwnerToken, calculateProfit);

//expenses
router.get("/expenses", authenticateOwnerToken, getExpenses);

//id is employeeId
router.get("/expenses/:id", authenticateOwnerToken, getExpensesOfEmp);
router.post("/expenses", authenticateOwnerToken, createExpense);
router.put("/expenses/:id", authenticateOwnerToken, updateExpense);
router.delete("/expenses/:id", authenticateOwnerToken, deleteExpense);

//Support_tickets
router.get("/tickets", authenticateOwnerToken, getAllSupportTickets);
router.put("/ticket/:id/close", authenticateOwnerToken, closeSupportTicket);

//Support tickets replies
router.post("/ticket/:id/reply", authenticateOwnerToken, createReply);

//alert ticket
router.get("/issues", authenticateOwnerToken, getAllAlertTickets);
router.put("/issues/:id/close", authenticateOwnerToken, closeAlertTicket);
router.post("/issues", authenticateOwnerToken, createAlertTicket);

router.get("/assigned-issues/:id", authenticateOwnerToken, getAssignedTickets);

//alert replies
router.post("/issue/:id/reply", authenticateOwnerToken, createAlertReply);

//analytics
router.get("/analytics/bills", authenticateOwnerToken, getBillsAnalytics);

module.exports = router;
