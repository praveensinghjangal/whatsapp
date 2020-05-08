const express = require('express');
const router = express.Router();
const user_func = require("./api");

router.get("/:user_id", user_func.get_user);
router.get("/config", user_func.get_user_config);

router.post("/signup", user_func.create_user);
// router.post("/login", user_func.login);

// router.post("/change_password", user_func.change_password);

router.put("/update", user_func.update_user);
router.put("/deactivate", user_func.deactivate_user);
router.put("/activate", user_func.activate_user);

module.exports = router;
