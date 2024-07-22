// jest.mock('@advocate-insights/ms-common', () => {
//     const originalModule = jest.requireActual('@advocate-insights/ms-common');

//     return {
//         __esModule: true,
//         ...originalModule,
//         publisher: jest.fn(),
//     };
// });

// Environment variables
// process.env.USER_TABLE_NAME = 'user';
// process.env.CLIENT_TABLE_NAME = 'user-client';
// process.env.EVENT_BUS_NAME = 'test';
// process.env.REACT_APP_COGNITO_CLIENT_ID = 'abc123';
// process.env.USER_POOL_NAME = 'abc123';
// process.env.AWS_REGION = 'us-east-1';

if (!process.env.DEBUG) {
    global.console.log = jest.fn();
    global.console.error = jest.fn();
}

beforeAll(async () => {});

beforeEach(async () => {});
