// This is a wrapper to make the CommonJS predictor_engine work with ES modules
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { evaluateActionList } = require('./predictor_engine.js');

export { evaluateActionList };
