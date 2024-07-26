import { RouteHandler } from '../api';
import { DatabaseError } from '../api-errors';
import { User } from '../models/user';

export const delUserHandler: RouteHandler = async (req) => {
    const id = String(req.query.userId);

    try {
        const deleteResult = await User.deleteOne({ _id: id });

        if (deleteResult.deletedCount === 0) {
            throw new DatabaseError(`Could not delete user with id ${id}`);
        }
    } catch (err) {
        throw new DatabaseError(`Could not delete user with id ${id}`);
    }

    return {};
};
