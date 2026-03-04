const RoomListingModel = require("../db/models/roomListing.model");

const postRoomListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      amenities,
      description,
      furnished,
      location,
      price,
      roomType,
      title,
    } = req.body;

    const imagePaths = req.files.map((file) => file.path);
    const roomListingModel = new RoomListingModel({
      amenities,
      description,
      furnished,
      location,
      price,
      roomType,
      title,
      user: userId,
      images: imagePaths,
    });
    const roomListing = await roomListingModel.save();
    res.status(201).json({
      message: "Room Listing Successful",
      success: true,
      roomId: roomListing._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
    console.log(error);
  }
};

const getRoomListing = async (req, res) => {
  try {
    const listings = await RoomListingModel.find();
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
    // console.log(error)
  }
};

const filterRoomListings = async (req, res) => {
  try {
    const { minPrice, maxPrice, roomType, location, furnished } = req.body;
    // console.log(req.body)
    const query = {};
    if (minPrice > 0) {
      query.price = { $gte: 0, $lte: minPrice };
    }
    if (roomType && roomType != "any") {
      query.roomType = roomType.toLowerCase();
    }
    if (location) {
      query.location = new RegExp(location, "i");
    }
    if (furnished && furnished != "any") {
      query.furnished = furnished.toLowerCase();
    }

    // console.log("querry is:", query)

    const listings = await RoomListingModel.find(query);
    res.status(200).json({ data: listings, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
    // console.log(error)
  }
};

const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await RoomListingModel.findById(id).populate("user", "email");

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      message: "Room details fetched successfully",
      data: room,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getRoomByUser = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await RoomListingModel.find({ user: id }).populate(
      "user",
      "email"
    );

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    res.status(200).json({
      success: true,
      message: "Room details fetched successfully",
      data: room,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteRoomListing = async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomListing = await RoomListingModel.findById(roomId);

    if (!roomListing) {
      return res
        .status(404)
        .json({ success: false, message: "Room Listing not found." });
    }

    if (
      roomListing.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to delete this room listing",
        });
    }

    const deletedRoom = await RoomListingModel.findByIdAndDelete(roomId);

    res.status(200).json({
      success: true,
      message: "Room Listing deleted successfully",
      deletedRoom,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateRoomListing = async (req, res) => {
  try {
    const {
      amenities,
      description,
      furnished,
      location,
      price,
      roomType,
      title,
    } = req.body;
    const { id } = req.params;
    const updateData = {
      title,
      description,
      price,
      roomType,
      location,
      amenities,
      furnished,
    };

    const existingRoom = await RoomListingModel.findById(id);

    if (!existingRoom) {
      return res
        .status(404)
        .json({ message: "Room listing not found", success: false });
    }

    if (
      existingRoom.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this room listing",
      });
    }

    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map((file) => file.path);
      updateData.images = [...existingRoom.images, ...newImagePaths];
    }

    const roomListing = await RoomListingModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    res.status(200).json({
      message: "Room listing updated successfully",
      success: true,
      roomId: roomListing._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
    console.log(error);
  }
};

const getMyRoomListings = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await UserModel.findOne({ email });
    const rooms = await RoomListingModel.find({ user: user._id });
    // console.log(rooms)

    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  postRoomListing,
  getRoomListing,
  filterRoomListings,
  getRoomById,
  deleteRoomListing,
  updateRoomListing,
  getMyRoomListings,
  getRoomByUser,
};
