// server.js or paymentController.ts
import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from Stripe Backend");
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Seller Account (Express + Mongoose)
// POST /create-seller-account
app.post("/create-seller-account", async (req, res) => {
  // const user = await User.findById(req.user.id) ; // from your authentication middleware

  // if (!user.stripeAccountId) {
  const account = await stripe.accounts.create({
    type: "express",
    country: "GB",
    email: "rafi@gmail.com", // Replace with user's email
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }, // 👈 THIS IS REQUIRED!
    },
  });
  console.log(account.id);
  // user.stripeAccountId = account.id;
  // user.stripeAccountCreated = true;
  // await user.save();
  // }

  const accountLink = await stripe.accountLinks.create({
    account: account?.id,
    refresh_url: "http://localhost:5173/billing",
    return_url: `http://localhost:5173/return/${account?.id}`,
    type: "account_onboarding",
  });

  res.json({ url: accountLink?.url, id: account?.id });
});

//Create Payment Intent and Enable Apple Pay, Google Pay, and Cards
app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  // const seller = await User.findById(sellerId);
 
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "GBP",
      automatic_payment_methods: { enabled: true }, // Enables Apple Pay, GPay, and Cards
      application_fee_amount: Math.round(Number(amount) * 0.5), // 5% fee
      transfer_data: {
        destination: "", // Transfer to the seller's account
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({ error: error });
  }
});
// This is how we’ll know if the payment was completed:
// POST /stripe/webhook
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log("PaymentIntent was successful:", paymentIntent);
      // Update order in DB, notify seller, etc.
    }

    res.sendStatus(200);
  }
);

app.listen(port, () => console.log("Server running on port 5000"));
