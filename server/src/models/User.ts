import { Schema, model } from 'mongoose';

export interface IUser {
  name?: string;
  email: string;
  passwordHash: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
