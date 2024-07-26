import {
    HttpFunction,
    Request,
    Response,
} from '@google-cloud/functions-framework';
import { RequestHelper } from '../utils/request-helper';
import { BadMethodError, BadRequestError, CustomError } from '../api-errors';
import { healthcheckHandler } from '../route-handlers/healthcheck';
import { ResponseBody } from '../api';
import mongoose from 'mongoose';
import { validateEnvVars } from '../utils/validations';
import { createUserHandler } from '../route-handlers/create-user';

const startDb = async () => {
    try {
        await mongoose.connect(
            'mongodb://' +
                process.env.DB_USER +
                ':' +
                process.env.DB_PASSWORD +
                '@' +
                process.env.DB_HOST +
                ':27017/' +
                process.env.DB_NAME
        );
    } catch (err) {
        console.error(err);
    }
};

export const handler: HttpFunction = async (req: Request, res: Response) => {
    console.log('Request received:', req);

    validateEnvVars();
    await startDb();

    let status = 200;
    let body: ResponseBody = {};

    try {
        switch (RequestHelper.getPath(req)) {
            case '/healthcheck':
                if (req.method === 'GET') {
                    body = await healthcheckHandler(req);
                } else {
                    throw new BadMethodError();
                }
                break;

            case '/users':
                switch (req.method) {
                    case 'POST':
                        body = await createUserHandler(req);
                        break;

                    default:
                        throw new BadMethodError();
                }
                break;

            default:
                // We should never reach this point if the API Gateway is configured properly
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

    res.status(status).send(JSON.stringify(body));
};
