// Import constants from JSON file
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const constantsData = require('../data/constants.json');

export const constants = constantsData;