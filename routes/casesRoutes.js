const express = require("express");
const router = express.Router();
const casesController = require("../controllers/casesController");

router.get("/", casesController.getAllCases);
router.get("/:id", casesController.getCaseById);
router.post("/", casesController.createCase);
router.put("/:id", casesController.updateCase);
router.delete("/:id", casesController.deleteCase);

module.exports = router;
