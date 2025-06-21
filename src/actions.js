// Import actions from JSON file
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const actionsData = require('../data/actions.json');

export const actions = actionsData;
