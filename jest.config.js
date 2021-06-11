module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: [
        "<rootDir>/src/**/*.spec.ts",
        "<rootDir>/tests/**/*.spec.ts",
    ],
    restoreMocks: true,
};
