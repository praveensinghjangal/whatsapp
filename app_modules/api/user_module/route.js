const express = require('express');
const router = express.Router();
const user_func = require("./api");

// router.get("/", user_func.get_user);
// router.get("/config", user_func.get_user_config);

// router.post("/signup", user_func.create_user);
router.get("/", user_func.get_user_info);
router.put("/", user_func.update_user_info);

// router.post("/change_password", user_func.change_password);

// router.put("/", user_func.update_user);
// router.put("/deactivate", user_func.deactivate_user);
// router.put("/activate", user_func.activate_user);

module.exports = router;
