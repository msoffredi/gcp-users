import { Context, EventFunction } from '@google-cloud/functions-framework';
import { PubsubMessage } from '@google-cloud/pubsub/build/src/publisher';
import { validateEnvVars } from '../utils/validations';
import { MongoDBHelper } from '../utils/mongodb-helper';
import { EventTypes } from '../events';
import { clientCreatedEventHandler } from '../event-handlers/client-created-event';
import { clientDeletedEventHandler } from '../event-handlers/client-deleted-event';

export const eventsHandler: EventFunction = async (
    event: PubsubMessage,
    context: Context
): Promise<void> => {
    console.log('Event received:', event);
    console.log('Event context', context);

    validateEnvVars();
    await MongoDBHelper.startDb();

    if (event.attributes?.type === EventTypes.ClientCreated) {
        await clientCreatedEventHandler(event);
        return;
    }

    if (event.attributes?.type === EventTypes.ClientDeleted) {
        await clientDeletedEventHandler(event);
        return;
    }
};
