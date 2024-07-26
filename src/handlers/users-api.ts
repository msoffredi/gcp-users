import {
    HttpFunction,
    Request,
    Response,
} from '@google-cloud/functions-framework';
import { RequestHelper } from '../utils/request-helper';
import { BadMethodError, BadRequestError, CustomError } from '../api-errors';
import { healthcheckHandler } from '../route-handlers/healthcheck';
import { ResponseBody } from '../api';
import { validateEnvVars } from '../utils/validations';
import { createUserHandler } from '../route-handlers/create-user';
import { MongoDBHelper } from '../utils/mongodb-helper';
import { getOneUserHandler } from '../route-handlers/get-one-user';
import { delUserHandler } from '../route-handlers/del-user';

export const handler: HttpFunction = async (req: Request, res: Response) => {
    console.log('Request received:', req);

    validateEnvVars();
    await MongoDBHelper.startDb();

    let status = 200;
    let body: ResponseBody = {};

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
            } else {
                throw new BadMethodError();
            }
        } else if (RequestHelper.getPath(req).startsWith('/users/')) {
            switch (req.method) {
                case 'GET':
                    body = await getOneUserHandler(req);
                    break;
                // case 'PUT':
                //     // update user
                //     break;
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
