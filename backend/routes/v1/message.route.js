const {
  ensureConversation,
  getContacts,
  getMessages,
  sendMessage,
} = require("../../controllers/message.controller");
const { ensureAuthenticated } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.post("/ensureConversation", ensureAuthenticated, ensureConversation);
router.get("/contacts", ensureAuthenticated, getContacts);
router.get("/:id", ensureAuthenticated, getMessages);
router.post("/sendMessage/:id", ensureAuthenticated, sendMessage);

module.exports = router;
