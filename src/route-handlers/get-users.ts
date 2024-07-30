import { ResponseBody, RouteHandler } from '../api';
import { User, UserRecord } from '../models/user';
import { Request } from '@google-cloud/functions-framework';

export const getUsersHandler: RouteHandler<
    Request,
    ResponseBody<UserRecord>
> = async (req) => {
    let query = User.find().sort('-createdAt');

    if (req.query.lastCreatedAt) {
        query = query.where('createdAt').lt(Number(req.query.lastCreatedAt));
    }

    const findResult = await query.limit(Number(req.query.limit || 20)).exec();

    return {
        count: findResult.length,
        data: findResult,
    };
};
