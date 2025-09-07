import mongoose, { Schema, Model } from "mongoose";
import { IUserDocument, UserRole } from "../interfaces/user";
import bcrypt from "bcryptjs";

const userSchema = new Schema<IUserDocument>(
  {
    firstname: {
      type: String,
      required: [true, "Please add a first name"],
      minlength: [1, "First name must be at least 1 character"],
      maxlength: [255, "First name cannot exceed 255 characters"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Please add a last name"],
      minlength: [1, "Last name must be at least 1 character"],
      maxlength: [255, "Last name cannot exceed 255 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "Please add date of birth"],
      validate: [
        {
          validator: function (value: string): boolean {
            // Validate MM-DD-YYYY format
            const dateRegex =
              /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-(19|20)\d{2}$/;
            return dateRegex.test(value);
          },
          message:
            "Date of birth must be in MM-DD-YYYY format (e.g., 01-15-1990)",
        },
        {
          validator: function (value: string): boolean {
            // Check if user is at least 21 years old
            const [month, day, year] = value.split("-").map(Number);
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
              return age - 1 >= 21;
            }

            return age >= 21;
          },
          message: "You must be at least 21 years old to register",
        },
      ],
    },
    linkedBet360Account: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the model
const User: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  userSchema
);

export default User;
