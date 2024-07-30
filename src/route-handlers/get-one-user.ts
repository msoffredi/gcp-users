import { DatabaseError, RouteHandler } from '@msoffredi/gcp-common';
import { User } from '../models/user';

export const getOneUserHandler: RouteHandler = async (req) => {
    const id = String(req.query.userId);

    const user = await User.findById(id);

    if (!user) {
        throw new DatabaseError(`Could not retrieve user with id: ${id}`);
    }

    return user.toObject();
};
