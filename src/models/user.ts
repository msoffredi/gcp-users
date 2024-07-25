import mongoose from 'mongoose';

export interface UserRecord {
    name: string;
    email: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(newUser: UserRecord): UserDoc;
}

interface UserDoc extends mongoose.Document, UserRecord {}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
});

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
