import { isObject, baseShim } from './types-basic'
import { validateData } from './validation'
import { attachOptions } from './utils'
import type { Validator } from './types'


function isAnyOfShim(types: Validator[]) {
  const shim = baseShim(async (value: any) => {
    let result;
    for (let i = 0; i < types.length; i++) {
      const isObjectResult = isObject(types[i]);
      if (isObjectResult === true) {
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
  attachOptions(shim)
  return shim;
}


export {
  isAnyOfShim as isAnyOf,
};
