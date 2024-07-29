import mongoose from 'mongoose';

export interface ClientRecord {
    _id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ClientDoc extends mongoose.Document, ClientRecord {
    _id: string;
}

interface ClientModel extends mongoose.Model<ClientDoc> {
    build(newClient: ClientRecord): ClientDoc;
}

const clientSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: 'user-clients',
    }
);

clientSchema.set('toObject', {
    versionKey: false,
}).statics.build = (newClient: ClientRecord) => {
    return new Client(newClient);
};

const Client = mongoose.model<ClientDoc, ClientModel>('Client', clientSchema);

export { Client };
