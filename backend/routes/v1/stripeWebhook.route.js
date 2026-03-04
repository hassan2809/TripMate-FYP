const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const BookingModel = require("../../db/models/booking.model");
const appConfig = require("../../config/app.config");

const router = express.Router();
const stripe = Stripe(appConfig.stripe.stripe_secret);

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = appConfig.stripe.webhook_secret;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      try {
        const newBooking = new BookingModel({
          userId: metadata.userId,
          roomId: metadata.roomId,
          name: metadata.name,
          email: session.customer_email,
          phone: metadata.phone,
          checkInDate: metadata.checkInDate,
          checkOutDate: metadata.checkOutDate,
          numGuests: metadata.numGuests,
          specialRequests: metadata.specialRequests,
          totalPrice: metadata.totalPrice,
          status: "confirmed",
          paymentMethod: metadata.paymentMethod,
        });

        await newBooking.save();
      } catch (err) {
        console.error("Error saving booking:", err.message);
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
