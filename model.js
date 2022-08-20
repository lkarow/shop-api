const mongoose = require('mongoose');

let itemSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Brand: { type: String, required: true },
  Price: { type: Number, required: true },
  ImagePath: String,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  Cart: Array,
});

let Item = mongoose.model('Item', itemSchema);
let User = mongoose.model('user', userSchema);

module.exports.Item = Item;
module.exports.User = User;
