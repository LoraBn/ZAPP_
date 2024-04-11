const { Router } = require("express");
const { authenticateEmployeeToken } = require("../middleware/employeeAuth");
const {
  updateProfile,
  getCustomerListEmployee,
  createCustomerAccountEmployee,
  updateCustomerAccountEmployee,
  getCustomerBillEmp,
  createBillEmp,
  updateBillEmp,
  createAlertReplyEmp,
  createAlertTicketEmp,
  getAnnouncementsEmp,
  getElectricScheduleEmp,
  getKwhPriceEmp,
  getEmployeeExpenses,
  getAllOpenAlertTickets,
  closeAlertTicketEmp,
  checkActiveBillingCycleEmp,
  startBillingEmp,
  stopBillingEmp,
  calculateBillEmp,
  getPreviousMeterEmp,
  assignSelf,
  getEquipmentsEmp,
  getPlansEmp,
  getAssignedTicketsEmp,
  getSalary,
} = require("../controllers/Employee");
const router = Router();

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

router.get("/salary", authenticateEmployeeToken, getSalary);

//bills
router.get("/bills/:id", authenticateEmployeeToken, getCustomerBillEmp);
router.post("/bills/:id", authenticateEmployeeToken, createBillEmp);
router.put("/bills/:id", authenticateEmployeeToken, updateBillEmp);

//Billing cycle
router.get(
  "/billing-cycle",
  authenticateEmployeeToken,
  checkActiveBillingCycleEmp
);
router.post("/billing-cycle/start", authenticateEmployeeToken, startBillingEmp);
router.post("/billing-cycle/stop", authenticateEmployeeToken, stopBillingEmp);

//Previous Meter;
router.get(
  "/previous-meter/:id",
  authenticateEmployeeToken,
  getPreviousMeterEmp
);

//calculate Bill
router.post("/calculate-bill/:id", authenticateEmployeeToken, calculateBillEmp);

//Price
router.get("/price", authenticateEmployeeToken, getKwhPriceEmp);

//alerts
router.get("/issues", authenticateEmployeeToken, getAllOpenAlertTickets);
router.post("/issues", authenticateEmployeeToken, createAlertTicketEmp);
router.put("/issues/:id/close", authenticateEmployeeToken, closeAlertTicketEmp);

router.get(
  "/assigned-issues",
  authenticateEmployeeToken,
  getAssignedTicketsEmp
);

//asign ticket
router.post("/issues/:id/assign", authenticateEmployeeToken, assignSelf);

//alert replies
router.post(
  "/issue/:id/reply/",
  authenticateEmployeeToken,
  createAlertReplyEmp
);

//Announcements
router.get("/announcements", authenticateEmployeeToken, getAnnouncementsEmp);

//Electric schedule
router.get(
  "/electric-schedule",
  authenticateEmployeeToken,
  getElectricScheduleEmp
);

//Expenses
router.get("/expenses", authenticateEmployeeToken, getEmployeeExpenses);

router.get("/equipments", authenticateEmployeeToken, getEquipmentsEmp);
router.get("/plans", authenticateEmployeeToken, getPlansEmp);

module.exports = router;
