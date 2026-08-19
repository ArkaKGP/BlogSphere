const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username:{type: String, required: true},
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  likedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
