import { PubsubMessage } from '@google-cloud/pubsub/build/src/publisher';
import { Client } from '../models/client';

export const clientDeletedEventHandler = async (
    event: PubsubMessage
): Promise<void> => {
    if (typeof event.data === 'string') {
        const parsedData = JSON.parse(atob(event.data));

        if (!parsedData._id || !parsedData.name) {
            throw new Error(`Invalid event: ${JSON.stringify(parsedData)}`);
        }

        const id = parsedData._id;
        const deleteResult = await Client.deleteOne({ _id: id });

        if (deleteResult.deletedCount === 0) {
            throw new Error(`Could not delete client with id ${id}`);
        }
    } else {
        throw new Error(`Invalid event: ${JSON.stringify(event)}`);
    }
};
