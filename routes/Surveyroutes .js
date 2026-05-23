const router = require("express").Router();
const ctrl = require("../controllers/surveyController");
const auth = require("../middleware/auth");

router.get("/questions", auth, ctrl.getQuestions);
router.post("/answer", auth, ctrl.submitAnswer);
router.get("/stats", auth, ctrl.getStats);
router.post("/withdraw", auth, ctrl.initiateWithdrawal);

module.exports = router;