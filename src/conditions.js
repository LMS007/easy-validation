const { isObject } = require('./types-basic')
const { validateData } = require('./validation')

/**
 * 
 * @param {any} value 
 * @returns 
 */
function required(value) {
  if (value === undefined) {
    return 'value is required but missing';
  }
  return true;
};
required.priority = 3; // needed for ordering

/**
 * 
 * @param {any} value 
 * @returns 
 */
function notEmpty(value) {
  return value === '' ? "string value can not be empty" : true
}
notEmpty.priority = 2; // needed for ordering


/**
 * @type {(list: string[]) => Validator}
 */
function inList(list) {
  const validator = (value => {
    if (list.indexOf(value) >= 0) {
      return true;
    }
    return `value does not match accepted values: [${list}]`;
  });
  validator.priority = 2; // needed for ordering
  return validator
};

/**
 * For upper or lower, pass undefined to ignore the boundary limit
 * 
 * @type {(lower: number|undefined ,upper: number|undefined) => Validator}
 */
function range(lower, upper) {
  const validator = (value) => {
    
    if (Array.isArray(value)) {
      if (lower === undefined ) {
        if (value.length > upper) {
          return `array size must be less than or equal to ${upper}`;
        }
        else {
          return true;
        }
      }
      else if(upper === undefined ) {
        if (value.length < lower) {
          return `array size must be greater than or equal to ${lower}`;
        }
        else {
          return true;
        }
      }
      else if (value.length >= lower && value.length <= upper) {
        return true;
      } else {
        return `array size falls outside of range (${lower}, ${upper})`;
      }
    }
    else {
      if (lower === undefined ) {
        if (value > upper) {
          return `value must be less than or equal to ${upper}`;
        }
        else {
          return true;
        }
      }
      else if(upper === undefined ) {
        if (value < lower) {
          return `value must be greater than or equal to ${lower}`;
        }
        else {
          return true;
        }
      }
      else if (value >= lower && value <= upper) {
        return true;
      } else {
        return `value falls outside of range (${lower}, ${upper})`;
      }
    }
    
  }
  validator.priority = 2; // needed for ordering
  return validator;
};


/**
 * Restrict the array to a particular type.
 *  - An empty array is still valid with this condition.
 * @type {(type: Validator) => Validator}
 */
function ofType(type) {
  const shim = async (value, prefix = '') => {
    
    if (prefix !== '') {
      prefix = `${prefix}.`;
    }

    let results = [];
    // multiple errors may be returned if the type is an object
    for (let i = 0; i < value.length; i++) {
      if (isObject(type)) {
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
  };
  shim.priority = 0; // needed for ordering
  return shim;
};


/**
 * @type {(shape: Object) => Validator}
 */
function ofShape(shape) {
  const shim = async (value, prefix = '') => {
    const isObjectResult = isObject(value);
    if (isObjectResult === true) {
      return await validateData(shape, value, prefix);
    }
    return isObjectResult;
  };
  shim.priority = 0; // needed for ordering
  return shim;
};


module.exports = {
  // validators
  range,
  inList,
  notEmpty,
  required,
  ofType,
  ofShape,
};
