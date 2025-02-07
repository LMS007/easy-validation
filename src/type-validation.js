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
  const isObject = isObjectShim(data);
  if (isObject !== true) {
    // data is not an object, don't proceed any further
    return isObject;
  }

  const results = [];

  // ensures we don't pass extraneous values
  const extraneousKeysArr = data ? Object.keys(data) : [];
  // key with true are extraneous, otherwise not.
  const extraneousKeyMap = extraneousKeysArr.reduce((map, key) => {
    map[key] = true
    return map;
  }, {});

  const keys = Object.keys(schema);
  for (var i = 0; i < keys.length; i++) {
    const key = keys[i];
  //Object.keys(schema).forEach(async key => {

    delete extraneousKeyMap[key]; // key is handled by scheme, remove from map
    const schemaValue = schema[key];
    const dataValue = data ? data[key] : undefined;
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    let result;

    if (typeof schemaValue === 'object') {
      if (dataValue !== undefined) {
        // only follow this branch if there is matching data. Note that object
        // schemes are optional as opposed to isObject.isRequired
        result = await validateData(schemaValue, dataValue, newPrefix);
      }
    } else {
      result = await schemaValue(dataValue, newPrefix);
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

  for (extraneousKey in extraneousKeyMap) {
    const key = prefix ? `${prefix}.${extraneousKey}` : extraneousKey;
    results.push({
      key,
      error: 'extraneous key found',
    });

  }
  return results.length ? results : true;
}

function transformResult(validationErrors, type) {
}

function toKeys(validationResult) {
  const keyErrors = validationResult.reduce((acc, item) => {
    acc[item.key] = item.error
    return acc;
  }, {});
  return keyErrors;
}





/**
 * @type {Validator} shim
 */
function baseShim(shim) {
  return (value, ...args) => {
    if (value === undefined) {
      return true;
    } else {
      return shim(value, ...args);
    }
  };
}

/**
 * @type {Validator} shim
 */
function addRequiredCondition(shim) {
  shim.isRequired = (value, ...args) => {
    if (value === undefined) {
      return 'value is required but missing';
    }
    return shim(value, ...args);
  };
}

/**
 * @param {Validator[]} types
 */
function oneOfTypeShim(types) {
  const shim = baseShim(async (value) => {
    let result;
    for (let i = 0; i < types.length; i++) {
      const isObject = isObjectShim(types[i]);
      if (isObject === true) {
        result = await validateData(types[i], value);
      } else {
        result = await types[i](value)
      }
      if (result === true) {

        // bail on first success
        return true;
      }
    }
    return 'value failed to match one of the the allowed types'
  });
  addRequiredCondition(shim);
  return shim;
}

/**
 * @param {any} value
 */
function isStringShim(value) {
  return baseShim(value => {
    if (typeof value === 'string') {
      return true;
    }
    return 'value is not a string';
  })(value);
}

isStringShim.condition = (customCondition) => {
  const shim = baseShim(async value => {
    return await customCondition(value);
  });
  addRequiredCondition(shim);
  return shim;
};


/**
 * @type {(list: any[]) => Validator}
 */
isStringShim.oneOf = list => {
  const shim = baseShim(value => {
    const isString = isStringShim(value);
    if (isString === true) {
      if (list.indexOf(value) >= 0) {
        return true;
      }
      return `value does not match accepted values: [${list}]`;
    }
    return isString;
  });
  addRequiredCondition(shim);
  return shim;
};

addRequiredCondition(isStringShim);

/**
 * @param {any} value
 */
function isCustomShim(customCondition) {
  const shim = baseShim(async value => {
    return await customCondition(value);
  });
  addRequiredCondition(shim);
  return shim;
};

/**
 * @param {any} value
 */
const isBooleanShim = baseShim(value => {
  if (typeof value === 'boolean') {
    return true;
  }
  return 'value is not a boolean';
});

addRequiredCondition(isBooleanShim);

/**
 * @param {any} value
 */
function isNumericShim(value) {
  return baseShim(value => {
    if (typeof value === 'number') {
      return true;
    }
    return 'value is not a number';
  })(value);
}

/**
 * @type {(lower: number ,upper: number) => Validator}
 */
isNumericShim.limit = (lower, upper) => {
  const shim = baseShim(value => {
    const isNumeric = isNumericShim(value);
    if (isNumeric === true) {
      if (value >= lower && value <= upper) {
        return true;
      } else {
        return `value falls outside of range (${lower}, ${upper})`;
      }
    }
    return isNumeric;
  });
  addRequiredCondition(shim);
  return shim;
};

addRequiredCondition(isNumericShim);

/**
 * @param {any} value
 */
function isIntegerShim(value) {
  return baseShim(value => {
    if (Number.isInteger(value)) {
      return true;
    }
    return 'value is not an integer';
  })(value);
}

/**
 * @type {(lower: number ,upper: number) => Validator}
 */
isIntegerShim.limit = (lower, upper) => {
  const shim = baseShim(value => {
    const isInteger = isIntegerShim(value);
    if (isInteger === true) {
      if (value >= lower && value <= upper) {
        return true;
      } else {
        return `value falls outside of range (${lower}, ${upper})`;
      }
    }
    return isInteger;
  });
  addRequiredCondition(shim);
  return shim;
};

addRequiredCondition(isIntegerShim);

/**
 * @param {any} value
 */
const isFunctionShim = baseShim(value => {
  if (typeof value === 'function') {
    return true;
  }
  return 'value is not a function';
});

addRequiredCondition(isFunctionShim);

/**
 * @param {any} value
 */
function isArrayShim(value) {
  return baseShim(value => {
    if (Array.isArray(value)) {
      return true;
    }
    return 'value is not an array';
  })(value);
}

/**
 * Restrict the array to a particular type.
 *  - An empty array is still valid with this condition.
 * @type {(type: Validator) => Validator}
 */
isArrayShim.ofType = (type) => {
  const shim = baseShim(async (value, prefix = '') => {
    if (prefix !== '') {
      prefix = `${prefix}.`;
    }

    const isArray = isArrayShim(value);
    if (isArray === true) {
      let result;
      let results = [];
      // multiple errors may be returned if the type is an object
      for (let i = 0; i < value.length; i++) {
        if (isObjectShim(type) === true) {
          result = await validateData(type, value[i], `${prefix}${i}`);
        } else {
          result = await type(value[i], `${prefix}${i}`);
        }

        if (typeof result === 'string') {
          // simple error from leaf node
          results.push({
            key: `${prefix}${i}`,
            error: result,
          });
        } else if (result.length) {
          // multiple errors from branch
          results.push(...result);
        }
      }
      return results.length ? results : true
    }
    return isArray;
  });
  addRequiredCondition(shim);
  return shim;
};

addRequiredCondition(isArrayShim);

/**
 * @param {any} value
 */
function isObjectShim(value, ...args) {
  return baseShim((value, pre) => {
    // ensure null and array types are rejected
    if (value && value.constructor === {}.constructor) {
      return true;
    }
    return 'value is not an object';
  })(value);
}

/**
 * @type {(shape: Object) => Validator}
 */
isObjectShim.ofShape = shape => {
  const shim = baseShim(async (value, prefix = '') => {
    const isObject = isObjectShim(value);
    if (isObject === true) {
      return await validateData(shape, value, prefix);
    }
    return isObject;
  });
  addRequiredCondition(shim);
  return shim;
};

addRequiredCondition(isObjectShim);


module.exports = {
  // validators
  isString: isStringShim,
  isBoolean: isBooleanShim,
  isNumeric: isNumericShim,
  isInteger: isIntegerShim,
  isFunction: isFunctionShim,
  isArray: isArrayShim,
  isObject: isObjectShim,
  oneOfType: oneOfTypeShim,
  isCustom: isCustomShim,

  // validation runner
  validateData: validateData,
  toKeys: toKeys
};
