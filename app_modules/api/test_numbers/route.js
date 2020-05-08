const express = require('express');
const router = express.Router();
const user_func = require("./api");

// router.get("/", user_func.get_user);
// router.get("/config", user_func.get_user_config);
router.post("/", user_func.create_test_numbers);
router.post("/verify_otp", user_func.verify_otp);
router.put("/reset_number", user_func.reset_number);
router.put("/reset_all", user_func.reset_all);
// router.post("/signup", user_func.create_user);
// router.post("/", user_func.test_number);
// router.get("/", user_func.view_template);
// router.get("/:template_id", user_func.view_single_template);
// router.put("/:template_id", user_func.update_template);
// // router.delete("/change_status/:template_id", user_func.change_status_template);
// router.put("/approve/:template_id", user_func.approve_template);

// router.post("/change_password", user_func.change_password);

// router.put("/", user_func.update_user);
// router.put("/deactivate", user_func.deactivate_user);
// router.put("/activate", user_func.activate_user);

module.exports = router;
