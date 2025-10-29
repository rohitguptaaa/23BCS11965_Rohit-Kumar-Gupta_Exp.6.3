import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.post("/create-users", async (req, res) => {
  await User.deleteMany({});
  const users = await User.insertMany([
    { name: "Alice", balance: 1000 },
    { name: "Bob", balance: 500 }
  ]);
  res.status(201).json({ message: "Users created", users });
});

app.post("/transfer", async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  const sender = await User.findById(fromUserId);
  const receiver = await User.findById(toUserId);

  if (!sender || !receiver)
    return res.status(404).json({ message: "User not found" });

  if (sender.balance < amount)
    return res.status(400).json({ message: "Insufficient balance" });

  sender.balance -= amount;
  receiver.balance += amount;

  await sender.save();
  await receiver.save();

  res.status(200).json({
    message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
    senderBalance: sender.balance,
    receiverBalance: receiver.balance
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
