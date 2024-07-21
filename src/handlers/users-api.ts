import {
    HttpFunction,
    Request,
    Response,
} from '@google-cloud/functions-framework';
import { RequestHelper } from '../utils/request-helper';
import { BadMethodError, BadRequestError, CustomError } from '../api-errors';
import { healthcheckHandler } from '../route-handlers/healthcheck';
import { ResponseBody } from '../api';

export const handler: HttpFunction = async (req: Request, res: Response) => {
    console.log('Request received:', req);

    let status = 200;
    let body: ResponseBody = {};

    try {
        switch (RequestHelper.getXEnvoyOriginalPath(req)) {
            case '/healthcheck':
                if (req.method === 'GET') {
                    body = await healthcheckHandler(req);
                } else {
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

    res.status(status).send(body);
};
