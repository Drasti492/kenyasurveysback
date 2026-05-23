const router = require("express").Router();
const ctrl = require("../controllers/activationController");
const auth = require("../middleware/auth");

router.post("/initiate", auth, ctrl.initiateActivation);
router.get("/status/:reference", ctrl.checkActivationStatus);
router.post("/callback", ctrl.activationCallback);

module.exports = router;