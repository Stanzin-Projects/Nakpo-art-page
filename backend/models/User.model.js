import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    line1: { type: String, required: true },
    line2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    salt: { type: String, required: true },
    hash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    // Deactivated accounts keep their data but can no longer sign in or act.
    isActive: { type: Boolean, default: true },
    addresses: [addressSchema],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

userSchema.methods.toSafe = function toSafe() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    isAdmin: this.isAdmin || false,
    isActive: this.isActive !== false,
    addresses: this.addresses || [],
    favorites: this.favorites || [],
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
