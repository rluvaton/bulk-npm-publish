module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: [
        "<rootDir>/tests/**/*.spec.ts",
    ],
    restoreMocks: true,
};
