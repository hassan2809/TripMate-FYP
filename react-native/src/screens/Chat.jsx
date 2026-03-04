import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { io } from "socket.io-client";
import axios from "axios";
import { format, isToday, isYesterday } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";

// Initialize socket connection
const socket = io("http://localhost:8000/");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(true);
  const [userId, setUserId] = useState("");

  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const contactId = route.params?.contactId;

  useEffect(() => {
    if (!showContacts && selectedContact) {
      navigation.setOptions({
        tabBarStyle: { display: "none" },
      });
    } else {
      navigation.setOptions({
        tabBarStyle: {
          display: "flex",
        },
      });
    }
  }, [showContacts, selectedContact, navigation]);

  // Get user data from AsyncStorage
  const getUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      return { token, userId };
    } catch (error) {
      console.error("Failed to get user data:", error);
      return { token: null, userId: null };
    }
  };

  // Load userId when component mounts
  useEffect(() => {
    const loadUserId = async () => {
      const userData = await getUserData();
      setUserId(userData.userId);
    };

    loadUserId();
  }, []);

  // Register user with socket server
  useEffect(() => {
    const setupSocket = async () => {
      const { userId } = await getUserData();

      if (!userId) return;

      if (socket.connected) {
        socket.emit("registerUser", userId);
      } else {
        socket.on("connect", () => {
          socket.emit("registerUser", userId);
        });
      }
    };

    setupSocket();

    return () => {
      socket.off("connect");
    };
  }, []);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const { token } = await getUserData();
        if (!token) {
          setIsLoading(false);
          return;
        }

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
            setShowContacts(false);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [contactId]);

  // Fetch messages for the selected contact
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedContact) {
        try {
          const { token } = await getUserData();
          if (!token) return;

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
  }, [selectedContact]);

  // WebSocket listeners
  useEffect(() => {
    const handleNewMessage = async (msg) => {
      const { userId } = await getUserData();

      if (
        selectedContact &&
        (msg.senderId === selectedContact._id ||
          msg.recieverId === selectedContact._id) &&
        userId
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [selectedContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Send a new message
  const sendMessage = async () => {
    if (newMessage.trim() && selectedContact) {
      const { token, userId } = await getUserData();
      if (!token || !userId) return;

      const messageData = {
        message: newMessage,
      };

      try {
        await axios.post(
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

  // Check if the message is the first message of the day
  const isFirstMessageOfDay = (message, index) => {
    if (index === 0) return true;

    const currentDate = new Date(message.createdAt).setHours(0, 0, 0, 0);
    const previousDate = new Date(messages[index - 1].createdAt).setHours(
      0,
      0,
      0,
      0
    );

    return currentDate !== previousDate;
  };

  // Render message item
  const renderMessage = ({ item, index }) => {
    const isSender = item.senderId === userId;
    const showDate = isFirstMessageOfDay(item, index);

    return (
      <View key={index} style={styles.messageContainer}>
        {showDate && item.createdAt && (
          <View style={styles.dateContainer}>
            <View style={styles.dateChip}>
              <Text style={styles.dateText}>
                {formatMessageTime(item.createdAt)}
              </Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isSender ? styles.senderRow : styles.receiverRow,
          ]}
        >
          {!isSender && (
            <View style={styles.avatarContainer}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarText}>
                  {getContactInitial(selectedContact?.name)}
                </Text>
              </View>
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              isSender ? styles.senderBubble : styles.receiverBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isSender ? styles.senderText : styles.receiverText,
              ]}
            >
              {item.message}
            </Text>

            <View style={styles.messageTimeContainer}>
              <Text
                style={[
                  styles.messageTime,
                  isSender ? styles.senderTime : styles.receiverTime,
                ]}
              >
                {formatMessageTime(item.createdAt) || "12:00 PM"}
              </Text>

              {isSender && (
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={isSender ? "#bfdbfe" : "#9ca3af"}
                  style={{ marginLeft: 2 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render contact item
  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        selectedContact?._id === item._id && styles.selectedContactItem,
      ]}
      onPress={() => {
        setSelectedContact(item);
        setShowContacts(false);
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getContactInitial(item.name)}</Text>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <View style={styles.contactFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || "Click to open Conversation"}
          </Text>
          {/* <Text style={styles.messageTime}>{"09:35"}</Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyPlaceholder = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubble-ellipses" size={52} color="#2563eb" />
      </View>
      <Text style={styles.emptyTitle}>
        {selectedContact ? `Start a conversation` : "Your Messages"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {selectedContact
          ? `Send a message to start chatting with ${selectedContact.name}`
          : "Select a conversation to start chatting"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {showContacts ? (
        <View></View>
      ) : (
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setShowContacts(true);
              setSelectedContact(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          {selectedContact && (
            <View style={styles.contactHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getContactInitial(selectedContact.name)}
                </Text>
              </View>

              <Text style={styles.headerContactName}>
                {selectedContact.name}
              </Text>
            </View>
          )}
        </View>
      )}
      {/* Contacts List */}
      {showContacts ? (
        <View style={styles.contactsContainer}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#9ca3af"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conversations"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item._id}
              renderItem={renderContactItem}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>
                    {searchQuery
                      ? "No conversations match your search"
                      : "No conversations yet"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      ) : (
        /* Chat View */
        <View style={styles.chatContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 120}
          >
            <View style={styles.chatContainer}>
              {selectedContact ? (
                <>
                  {messages.length > 0 ? (
                    <FlatList
                      ref={flatListRef}
                      data={messages}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={renderMessage}
                      contentContainerStyle={styles.messagesList}
                    />
                  ) : (
                    <EmptyPlaceholder />
                  )}

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Type a message"
                      placeholderTextColor="#9ca3af"
                      value={newMessage}
                      onChangeText={setNewMessage}
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        !newMessage.trim() && styles.sendButtonDisabled,
                      ]}
                      onPress={sendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Ionicons name="send" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 40,
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1e40af",
  },
  // headerTitle: {
  //   fontSize: 20,
  //   fontWeight: "bold",
  //   color: "#ffffff",
  // },
  backButton: {
    marginRight: 12,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerContactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 12,
    textTransform: "capitalize",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#bfdbfe",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#bfdbfe",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2563eb",
  },
  keyboardAvoidView: {
    flex: 1,
    marginBottom: Platform.OS === "ios" ? 0 : 30, // Add margin at the bottom for Android
  },
  contactsContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 16,
    color: "#1f2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  contactItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedContactItem: {
    backgroundColor: "#eff6ff",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textTransform: "capitalize",
  },
  contactFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyListContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  messagesList: {
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 8,
  },
  dateContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  dateChip: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  dateText: {
    fontSize: 12,
    color: "#4b5563",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  senderRow: {
    justifyContent: "flex-end",
  },
  receiverRow: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 6,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  senderBubble: {
    backgroundColor: "#2563eb",
    borderTopRightRadius: 2,
  },
  receiverBubble: {
    backgroundColor: "#e5e7eb",
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
  },
  senderText: {
    color: "#ffffff",
  },
  receiverText: {
    color: "#1f2937",
  },
  messageTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  senderTime: {
    color: "#bfdbfe",
  },
  receiverTime: {
    color: "#9ca3af",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingBottom: 60,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: "#2563eb",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#bfdbfe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default Chat;
