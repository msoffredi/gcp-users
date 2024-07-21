// eslint-disable-next-line no-undef
module.exports = {
    // preset: '@shelf/jest-dynamodb',
    modulePathIgnorePatterns: [
        '<rootDir>/__tests__/utils',
        '<rootDir>/__tests__/events',
        '<rootDir>/__tests__/postman',
    ],
    clearMocks: true,
    setupFilesAfterEnv: ['./__tests__/utils/setup.ts'],
    collectCoverageFrom: ['src/**/*.{ts,js}'],
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.tsx?$': ['ts-jest'],
    },
};
