const ConversationModel = require("../db/models/conversation.model");
const MessageModel = require("../db/models/message.model.js");

const sendMessage = async (req, res) => {
  try {
    // console.log(req)
    const { message } = req.body;
    const { id: recieverId } = req.params;
    const senderId = req.user._id;
    // console.log("message sent")

    // console.log({
    //     messageContent: message,
    //     receiverId: recieverId,
    //     senderId: senderId
    // });

    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, recieverId] },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderId, recieverId],
      });
    }

    const newMessage = new MessageModel({
      senderId,
      recieverId,
      message,
    });

    await newMessage.save();

    if (newMessage) {
      // conversation.push(newMessage._id)
      conversation.messages.push(newMessage._id);
    }

    await conversation.save();

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "Failed to send messages" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = conversation.messages;

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "Failed to send messages" });
  }
};

// const getContacts = async (req, res) => {
//     try {
//         const contacts = await UserModel.find({}, 'name email');
//         res.json(contacts);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch contacts' });
//     }
// };

const getContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await ConversationModel.find({
      participants: userId,
    }).populate("participants", "name");

    // console.log(conversations);

    const contacts = conversations.map((conversation) => {
      return conversation.participants.find(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });

    res.status(200).json({ success: true, contacts });
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contacts" });
  }
};

const ensureConversation = async (req, res) => {
  try {
    const { creatorId } = req.body;
    const senderId = req.user._id;

    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, creatorId] },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderId, creatorId],
      });
    }

    res.status(200).json({ success: true, conversationId: conversation._id });
  } catch (error) {
    console.error("Failed to ensure conversation:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to ensure conversation" });
  }
};

module.exports = { getMessages, sendMessage, getContacts, ensureConversation };
