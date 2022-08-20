const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Item = mongoose.model('Item', itemSchema);
let User = mongoose.model('user', userSchema);

module.exports.Item = Item;
module.exports.User = User;
