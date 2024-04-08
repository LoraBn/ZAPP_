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
router.get("/remaining", authenticateCustomerToken, fetchRemaining);

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

module.exports = router;
