const express = require("express");
const router = express.Router();

const {
  createchatroom,
  getchats,
  deleteChats,
} = require("../controllers/chatcontroller");

router.route("/create/").post(createchatroom);
router.route("/:chatRoomId/messages/").get(getchats);
router.route("/delete/:chatRoomId").delete(deleteChats);
module.exports = router;
