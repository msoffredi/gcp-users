import { Context, EventFunction } from '@google-cloud/functions-framework';
import { PubsubMessage } from '@google-cloud/pubsub/build/src/publisher';
import { validateEnvVars } from '../utils/validations';
import { clientCreatedEventHandler } from '../event-handlers/client-created-event';
import { clientDeletedEventHandler } from '../event-handlers/client-deleted-event';
import { startDb } from '../utils/db';
import { EventTypes, MongoDBHelper } from '@msoffredi/gcp-common';

export const eventsHandler: EventFunction = async (
    event: PubsubMessage,
    context: Context
): Promise<void> => {
    console.log('Event received:', event);
    console.log('Event context', context);

    validateEnvVars();
    await startDb();

    switch (String(event.attributes?.type)) {
        case EventTypes.ClientCreated:
            await clientCreatedEventHandler(event);
            break;
        case EventTypes.ClientDeleted:
            await clientDeletedEventHandler(event);
            break;
        default:
            console.log('Unknown event type');
            return;
    }

    // Leaving connection closed when possible
    await MongoDBHelper.stopDb();
};
