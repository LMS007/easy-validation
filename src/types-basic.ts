import { attachOptions } from './utils'

function baseShim(shim: any) {
  return (value: any, ...args: any[]) => {
    if (value === undefined) {
      return true;
    } else {
      return shim(value, ...args);
    }
  };
}

function isStringShim(value: any) {
  return baseShim((value: any) => {
    if (typeof value === 'string') {
      return true;
    }
    return 'value is not a string';
  })(value);
}
attachOptions(isStringShim);

function isCustomShim(customCondition: any) {
  const shim = baseShim(async (value: any) => {
    return await customCondition(value);
  }); 
  attachOptions(shim);
  return shim;
}

const isBooleanShim = baseShim((value: any) => {
  if (typeof value === 'boolean') {
    return true;
  }
  return 'value is not a boolean';
});
attachOptions(isBooleanShim);

function isNumericShim(value: any) {
  return baseShim((value: any) => {
    if (Number.isFinite(value)) {
      return true;
    }
    return 'value is not a number';
  })(value);
}
attachOptions(isNumericShim);

function isIntegerShim(value: any) {
  return baseShim((value: any) => {
    if (Number.isInteger(value)) {
      return true;
    }
    return 'value is not an integer';
  })(value);
}
attachOptions(isIntegerShim);

const isFunctionShim = baseShim((value: any) => {
  if (typeof value === 'function') {
    return true;
  }
  return 'value is not a function';
});
attachOptions(isFunctionShim);

function isArrayShim(value: any) {
  return baseShim((value: any) => {
    if (Array.isArray(value)) {
      return true;
    }
    return 'value is not an array';
  })(value);
}
attachOptions(isArrayShim);

function isObjectShim(value: any) {
  return baseShim((value: any) => {
    // ensure null and array types are rejected
    if (value && value.constructor === {}.constructor) {
      return true;
    }
    return 'value is not an object';
  })(value);
}
attachOptions(isObjectShim);

export {
  baseShim,
  isStringShim as isString,
  isBooleanShim as isBoolean,
  isNumericShim as isNumeric,
  isIntegerShim as isInteger,
  isFunctionShim as isFunction,
  isArrayShim as isArray,
  isObjectShim as isObject,
  isCustomShim as isCustom,
};
