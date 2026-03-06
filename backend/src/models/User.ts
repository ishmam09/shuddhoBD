import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export type UserRole = "citizen" | "analyst" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  nid?: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  profileImage?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["citizen", "analyst", "admin"],
      default: "citizen",
      required: true,
    },
    nid: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    address: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    profileImage: { type: String },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  const user = this as IUser;
  if (!user.isModified("password")) {
    return;
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", UserSchema);

