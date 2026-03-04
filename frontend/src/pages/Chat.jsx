import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  User,
  Search,
  Clock,
  MessageCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { format, isToday, isYesterday } from "date-fns";
import Navbar from "../components/Navbar";

const socket = io("http://localhost:8000/");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  const { contactId } = useParams();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (socket.connected) {
      socket.emit("registerUser", userId);
    } else {
      socket.on("connect", () => {
        socket.emit("registerUser", userId);
      });
    }

    return () => {
      socket.off("connect");
    };
  }, [userId]);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/chat/contacts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setContacts(response.data.contacts);

        if (contactId) {
          const foundContact = response.data.contacts.find(
            (contact) => contact._id === contactId
          );

          if (foundContact) {
            setSelectedContact(foundContact);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, [contactId, token]);

  // Fetch messages for the selected contact
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedContact) {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/v1/chat/${selectedContact._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.success) {
            setMessages(response.data.data);
          } else {
            setMessages([]);
          }
        } catch (error) {
          console.error("Failed to load messages:", error);
        }
      }
    };
    fetchMessages();
  }, [selectedContact, token]);

  // WebSocket listeners
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        selectedContact &&
        (msg.senderId === selectedContact._id ||
          msg.recieverId === selectedContact._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a new message
  const sendMessage = async () => {
    if (newMessage.trim() && selectedContact) {
      const messageData = {
        message: newMessage,
      };
      try {
        const response = await axios.post(
          `http://localhost:8000/api/v1/chat/sendMessage/${selectedContact._id}`,
          messageData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sentMessage = {
          message: newMessage,
          senderId: userId,
          recieverId: selectedContact._id,
          createdAt: new Date().toISOString(),
        };
        socket.emit("sendMessage", sentMessage);
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);

    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get contact initial for avatar
  const getContactInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 flex-shrink-0">
        <Navbar />
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {/* Contact List */}
        <div
          className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 shadow-sm flex flex-col overflow-hidden ${
            selectedContact && "hidden md:flex"
          }`}
        >
          <div className="p-4 bg-white z-10 shadow-sm flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations"
                className="pl-9 bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading conversations...
                </div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => {
                      setSelectedContact(contact);
                      navigate(`/chat/${contact._id}`);
                    }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                      selectedContact?._id === contact._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-gray-200">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                          {getContactInitial(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-medium text-gray-900 truncate capitalize">
                            {contact.name}
                          </h3>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500 truncate">
                          {contact.lastMessage || "Click to open Conversation"}
                        </p>
                          <p className="text-sm text-gray-500 truncate">
                          {"09:35"}
                        </p> 
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {searchQuery
                    ? "No conversations match your search"
                    : "No conversations yet"}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-white overflow-hidden ${
            !selectedContact && "hidden md:flex"
          }`}
        >
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 z-10 shadow-sm flex items-center flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-gray-500 hover:text-gray-700 mr-2"
                  onClick={() => {
                    setSelectedContact(null);
                    navigate("/chat");
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="h-10 w-10 border border-gray-200 mr-3">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {getContactInitial(selectedContact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-gray-900 capitalize">
                    {selectedContact.name}
                  </h2>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isSender = msg.senderId === userId;
                      const showDate =
                        index === 0 ||
                        (msg.createdAt &&
                          messages[index - 1].createdAt &&
                          new Date(msg.createdAt).toDateString() !==
                            new Date(
                              messages[index - 1].createdAt
                            ).toDateString());

                      return (
                        <React.Fragment key={index}>
                          {showDate && msg.createdAt && (
                            <div className="flex justify-center my-4">
                              <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                {formatMessageTime(msg.createdAt)}
                              </div>
                            </div>
                          )}
                          <div
                            className={`flex ${
                              isSender ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isSender && (
                              <Avatar className="h-8 w-8 mr-2 mt-1">
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {getContactInitial(selectedContact.name)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[75%] rounded-2xl p-3 
                              ${
                                isSender
                                  ? "bg-blue-600 text-white rounded-tr-none"
                                  : "bg-gray-200 text-gray-800 rounded-tl-none"
                              }`}
                            >
                              <p className="break-words">{msg.message}</p>
                              <div
                                className={`text-xs mt-1 flex items-center justify-end gap-1
                                ${isSender ? "text-blue-100" : "text-gray-500"}`}
                              >
                                {formatMessageTime(msg.createdAt) || "12:00 PM"}
                                {isSender && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-6 max-w-md">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-4 mx-auto w-16 h-16 flex items-center justify-center">
                        <MessageCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Send a message to start chatting with{" "}
                        {selectedContact.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200 z-10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message"
                      className="border-gray-300 focus:border-blue-500 pr-10 py-6 rounded-full bg-gray-50"
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700 h-10 w-10 rounded-full flex items-center justify-center p-0"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-6 max-w-md">
                <div className="bg-blue-100 text-blue-600 rounded-full p-6 mb-4 mx-auto w-24 h-24 flex items-center justify-center">
                  <MessageCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Your Messages
                </h3>
                <p className="text-gray-500">
                  Select a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;