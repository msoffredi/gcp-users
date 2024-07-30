import {
    HttpFunction,
    Request,
    Response,
} from '@google-cloud/functions-framework';
import { validateEnvVars } from '../utils/validations';
import { createUserHandler } from '../route-handlers/create-user';
import { getOneUserHandler } from '../route-handlers/get-one-user';
import { delUserHandler } from '../route-handlers/del-user';
import { getUsersHandler } from '../route-handlers/get-users';
import {
    BadMethodError,
    BadRequestError,
    CustomError,
    healthcheckHandler,
    MongoDBHelper,
    RequestHelper,
    ResponseBody,
} from '@msoffredi/gcp-common';
import { startDb } from '../utils/db';

export const apiHandler: HttpFunction = async (req: Request, res: Response) => {
    console.log('Request received:', req);

    validateEnvVars();
    await startDb();

    let status = 200;
    let body: ResponseBody<unknown> = {};

    try {
        if (RequestHelper.getPath(req) === '/healthcheck') {
            if (req.method === 'GET') {
                body = await healthcheckHandler(req);
            } else {
                throw new BadMethodError();
            }
        } else if (RequestHelper.getPath(req) === '/users') {
            if (req.method === 'POST') {
                body = await createUserHandler(req);
            } else if (req.method === 'GET') {
                body = await getUsersHandler(req);
            } else {
                throw new BadMethodError();
            }
        } else if (RequestHelper.getPath(req).startsWith('/users/')) {
            switch (req.method) {
                case 'GET':
                    body = await getOneUserHandler(req);
                    break;
                case 'DELETE':
                    body = await delUserHandler(req);
                    break;
                default:
                    throw new BadMethodError();
            }
        } else {
            throw new BadRequestError();
        }
    } catch (err) {
        console.error(err);

        if (err instanceof CustomError) {
            status = err.statusCode;
            body = {
                errors: err.serializeErrors(),
            };
        } else {
            throw err;
        }
    }

    // Leaving connection closed when possible
    await MongoDBHelper.stopDb();

    res.status(status)
        .set({ 'Access-Control-Allow-Origin': '*' })
        .send(JSON.stringify(body));
};
