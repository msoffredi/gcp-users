import { PubsubMessage } from '@google-cloud/pubsub/build/src/publisher';
import { Client } from '../models/client';

export const clientCreatedEventHandler = async (
    event: PubsubMessage
): Promise<void> => {
    if (typeof event.data === 'string') {
        const parsedData = JSON.parse(atob(event.data));

        if (!parsedData._id || !parsedData.name) {
            throw new Error(`Invalid event: ${JSON.stringify(parsedData)}`);
        }

        await Client.build({
            _id: parsedData._id,
            name: parsedData.name,
        }).save();
    } else {
        throw new Error(`Invalid event: ${JSON.stringify(event)}`);
    }
};
