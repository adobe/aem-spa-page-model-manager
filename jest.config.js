'use strict';

module.exports = {
    preset: 'ts-jest',
    setupFilesAfterEnv: [ '<rootDir>/test/Setup.ts' ],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    testMatch: [ '<rootDir>/test/*.test.ts' ],
    testPathIgnorePatterns: [
        'node_modules',
        'lib',
        'dist',
        'node'
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!<rootDir>/node_modules/'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/lib/',
        '/dist/',
        '/node/',
        'src/types.ts',
        'src/aem-spa-page-model-manager.ts'
    ],
    moduleFileExtensions: [
        'ts',
        'js',
        'json',
        'node'
    ]
};
