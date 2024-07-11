const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googlelogin,
  verifyUser,
  logout,
  getusers,
  UpdateProfilePhoto,
} = require("../controllers/usercontroller");
const protect = require("../middlewares/protect");

router.route("/register/").post(register);
router.route("/login/").post(login);
router.route("/googlelogin/").post(googlelogin);
router.route("/verify/").get(verifyUser);
router.route("/logout/").get(logout);
router.route("/getusers/").get(getusers);
router.route("/update-profile-image/:userid").put(UpdateProfilePhoto)

module.exports = router;
