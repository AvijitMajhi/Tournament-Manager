import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      avatar: { 
        type:String,
        required:true,
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        },
      refreshToken: {
        type: String,
        default: null,
      },
    


}
,  { timestamps: true,})
userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);

});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateAccessToken = function () {
  
  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
  }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({
    _id: this._id,
  }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
export const User = mongoose.model('User', userSchema);