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
} = require("../controllers/customer");
const router = Router();

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

//Support Tickets
router.get("/ticket/open", authenticateCustomerToken, getAllOpenTicketsCus);
router.post("/ticket",authenticateCustomerToken, createSupportTicketCus);
router.put("/ticket/:id/close", authenticateCustomerToken, closeSupportTicketCus);

//Support tickets replies
router.get("/ticket/:id/reply", authenticateCustomerToken, getAllTicketRepliesCus);
router.post("/ticket/:id/reply", authenticateCustomerToken, createReplyCus);


module.exports = router;
