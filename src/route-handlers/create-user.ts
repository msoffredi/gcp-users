// import { randomUUID } from 'crypto';
import * as yup from 'yup';
import { User, UserRecord } from '../models/user';
import { RouteHandler } from '../api';
import { ErrorEntry, RequestValidationError } from '../api-errors';

const validationSchema = yup.object({
    name: yup.string().min(2).required(),
    email: yup.string().email().required(),
});

export const createUserHandler: RouteHandler = async (req) => {
    const errors: ErrorEntry[] = [];

    if (!req.body) {
        throw new RequestValidationError([
            {
                message:
                    'You need to provide a user email and a name to add a new user',
            },
        ]);
    }

    let validatedBody: UserRecord = { name: '', email: '' };

    try {
        validatedBody = await validationSchema.validate(req.body, {
            abortEarly: false,
        });

        // Validate email does not exist
        const existingUser = await User.findOne({ email: validatedBody.email });

        if (existingUser) {
            errors.push({
                message: 'User email already exists',
                field: 'email',
            });
        }
    } catch (err: unknown) {
        if (err instanceof yup.ValidationError) {
            err.inner.forEach((error) => {
                errors.push({
                    message: String(error.errors[0]),
                    field: String(error.path),
                });
            });
        } else {
            console.error(err);
            throw new RequestValidationError([
                {
                    message: 'Unexpected error validating parameters',
                },
            ]);
        }
    }

    if (errors.length) {
        throw new RequestValidationError(errors);
    }

    // const id = randomUUID();

    const newUser: UserRecord = {
        email: validatedBody.email,
        name: validatedBody.name,
        // id: id,
    };

    const user = User.build(newUser);
    await user.save();

    // if (user) {
    //     // Publish user.created event
    //     await userPublisher({
    //         type: EventTypes.UserCreated,
    //         data: newUser,
    //     });
    // } else {
    //     throw new DatabaseError(
    //         `Could not create user with email ${requestBody.email}`
    //     );
    // }

    return user.toObject();
};
