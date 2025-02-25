const {isObject} = require('./types-basic')

/**
 * @typedef {(any)=>any} ValidatorFunction
 */

/**
 * @typedef ValidatorProperties
 * @prop {(any)=>any} [isRequired]
 * @prop {(any)=>any} [oneOf]
 * @prop {(any)=>any} [ofType]
 */

/**
 * @typedef {ValidatorFunction & ValidatorProperties} Validator
 */

/**
 * @typedef ValidationError
 * @prop {string} key
 * @prop {string} error
 */

/**
 * Validate the following `data` against the following `schema`. Returns true
 * if the data is valid, otherwise returns an array of ValidationErrors representing
 * error messages pertaining to the data.
 *
 * example:
 *
 * const schema = {
 *   a: validation.isString,
 *   b: validation.isString.isRequired,
 *   c: {
 *       d: validation.isInteger,
 *       e: validation.isArray.ofType(validation.isInteger).isRequired,
 *       f: validation.oneOf([
 *            validation.isFunction,
 *            validation.isString,
 *          ]).isRequired
 *   }
 * }
 *
 * let result = validateData(schema, sampleData);
 *
 * @param {Object} schema
 * @param {Object} data
 * @param {string} [prefix]
 * @return {true|ValidationError[]}
 */
async function validateData(schema, data, prefix = '') {
  if (typeof schema == 'function') {
    // no object literal supplied, just execute function
    return schema(data, prefix);
  }
  const isObjectResult = isObject(data);
  if (isObjectResult !== true) {
    // data is not an object, don't proceed any further
    return isObjectResult;
  }

  const results = [];

  // ensures we don't pass extraneous values
  const extraneousKeysArr = data ? Object.keys(data) : [];
  
  let keys = Object.keys(schema);
  const wildCardIndex = keys.indexOf('*') 
  if (wildCardIndex >= 0) {
    // wildcard should always been the only key
    if (keys.length > 1) {
      throw Error('Schema wildcard conflict. A wildcard can not have sibling keys')
    }
    const wildCards = (new Array(extraneousKeysArr.length)).fill('*')
    keys = wildCards; // override all keys with wildcards
  }

  for (var i = 0; i < keys.length; i++) {
    const schemaKey = keys[i];
    let dataKey = schemaKey; // always the same except for wildcard
    if (schemaKey === '*') {
      // wildcard takes precedence
      dataKey = extraneousKeysArr[0] // just take the first
    }
    const dataKeyIndex  = extraneousKeysArr.indexOf(dataKey); // will be 0 for wildcard, but could be any value otherwise
    if (dataKeyIndex >= 0) {
      // if found, remove from array
      extraneousKeysArr.splice(dataKeyIndex,1) 
    }

    const schemaValue = schema[schemaKey];
    const dataValue = data ? data[dataKey] : undefined;
    const newPrefix = prefix ? `${prefix}.${dataKey}` : dataKey;
    if(schemaValue === undefined) {
      // helps the user construct valid schemas
      throw Error(`incorrect schema value for ${newPrefix}`, )
    }
    
    let result = undefined;
    
    if (dataValue !== undefined || typeof schemaValue === 'function') {
      // drill deeper if there if the dataValue exists or the schemaValue is a function
      result = await validateData(schemaValue, dataValue, newPrefix);
    }

    if (typeof result === 'string') {
      // simple error from leaf node
      results.push({
        key: newPrefix,
        error: result,
      });
    }
    else if (Array.isArray(result)) {
      // multiple errors from branch
      results.push(...result);
    }
  }

  for (extraneousKey of extraneousKeysArr) {
    // error
    const key = prefix ? `${prefix}.${extraneousKey}` : extraneousKey;
    results.push({
      key,
      error: 'extraneous key found',
    });
  }
  return results.length ? results : true;
}

function toKeys(validationResult) {
  const keyErrors = validationResult.reduce((acc, item) => {
    acc[item.key] = item.error
    return acc;
  }, {});
  return keyErrors;
}

module.exports = {
  // validation runner
  validateData: validateData,
  toKeys: toKeys,
}