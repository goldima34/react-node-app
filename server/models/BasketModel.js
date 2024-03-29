const mongoose = require("mongoose");
const BasketItem = require("./BasketItem.js");

const Basket = new mongoose.Schema({
  userId: { type: String, required: false },
  basketItem: [
    {
      type: BasketItem.schema,
      required: false,
      unique: false,
      index: false,
    },
  ],
  totalPrice: {
    type: Number,
    required: false,
    unique: false,
    index: false,
    default: 0,
  },
});

module.exports = mongoose.model("Basket", Basket);
