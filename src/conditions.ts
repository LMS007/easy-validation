import { isObject } from './types-basic'
import { validateData } from './validation'

/**
 * Requires a value to be defined.
 */
function required(value: any) {
  if (value === undefined) {
    return 'value is required but missing';
  }
  return true;
}
(required as any).priority = 3; // needed for ordering
(required as any).hasRequiredCondition = true; // special case for shortcoming in validation

/**
 * Requires a string value to not be empty.
 */
function notEmpty(value: any) {
  return value === '' ? "string value can not be empty" : true
}
(notEmpty as any).priority = 2; // needed for ordering

/**
 * Restricts the value to a list of allowed values.
 */
function inList(list: string[]) {
  const validator = ((value: any) => {
    if (list.indexOf(value) >= 0) {
      return true;
    }
    return `value does not match accepted values: [${list}]`;
  }) as any;
  validator.priority = 2; // needed for ordering
  return validator
}

/**
 * For upper or lower, pass undefined to ignore the boundary limit.
 */
function range(lower: number | undefined, upper: number | undefined) {
  const validator = ((value: any) => {
    
    if (Array.isArray(value)) {
      if (lower === undefined ) {
        if (value.length > upper!) {
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
        if (value > upper!) {
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
    
  }) as any;
  validator.priority = 2; // needed for ordering
  return validator;
}

/**
 * Restrict the array to a particular type.
 * An empty array is still valid with this condition.
 */
function ofType(type: any) {
  const shim = (async (value: any, prefix: string = '') => {
    if (!value) {
      // if there is no array, ignore it, it could be omitted 
      // note: required() condition will error if added
      return true;
    }
    if (prefix !== '') {
      prefix = `${prefix}.`;
    }

    let results: any[] = [];
    let result;
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
  }) as any;
  shim.priority = 0; // needed for ordering
  return shim;
}

/**
 * Validates that the object matches the given shape.
 */
function ofShape(shape: any) {
  const shim = (async (value: any, prefix: string = '') => {
    const isObjectResult = isObject(value);
    if (isObjectResult === true) {
      return await validateData(shape, value, prefix);
    }
    return isObjectResult;
  }) as any;
  shim.priority = 0; // needed for ordering
  return shim;
}

export {
  range,
  inList,
  notEmpty,
  required,
  ofType,
  ofShape,
};
