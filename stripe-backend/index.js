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
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from Stripe Backend");
});


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//Create Payment Intent

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  console.log("Creating payment intent with amount:", typeof amount, amount);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true }, // Enables Apple Pay, GPay, and Cards
    });
    console.log(paymentIntent.client_secret);
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.listen(port, () => console.log("Server running on port 5000"));
