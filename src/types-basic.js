const { attachOptions  } = require('./utils')


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
attachOptions(isStringShim);

/**
 * @param {any} value
 */
function isCustomShim(customCondition) {
  const shim = baseShim(async value => {
    return await customCondition(value);
  }); 
  attachOptions(shim);
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
attachOptions(isBooleanShim);

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
attachOptions(isNumericShim);

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
attachOptions(isIntegerShim);


/**
 * @param {any} value
 */
const isFunctionShim = baseShim(value => {
  if (typeof value === 'function') {
    return true;
  }
  return 'value is not a function';
});

attachOptions(isFunctionShim);

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
attachOptions(isArrayShim);


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
attachOptions(isObjectShim);



module.exports = {
  // validators
  baseShim,
  isString: isStringShim,
  isBoolean: isBooleanShim,
  isNumeric: isNumericShim,
  isInteger: isIntegerShim,
  isFunction: isFunctionShim,
  isArray: isArrayShim,
  isObject: isObjectShim,
  isCustom: isCustomShim,
};
