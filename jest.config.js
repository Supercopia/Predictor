export default {
    // The root directory that Jest should scan for tests and modules
    rootDir: '.',
    
    // The test environment that will be used for testing
    testEnvironment: 'node',
    
    // The glob patterns Jest uses to detect test files
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    
    // An array of regexp pattern strings that are matched against all test paths
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    
    // Indicates whether each individual test should be reported during the run
    verbose: true,
    
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    
    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',
    
    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: 'v8',
    
    // A list of paths to directories that Jest should use to search for files in
    roots: [
        '<rootDir>/src/',
        '<rootDir>/tests/'
    ],
    
    // Transform files with babel for ES modules support
    transform: {},
    
    // Use experimental support for ES modules
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
    }
};
