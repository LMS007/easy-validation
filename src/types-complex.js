const { isObject, baseShim } = require('./types-basic')
const { validateData  } = require('./validation')
const { attachOptions  } = require('./utils')


/**
 * @param {Validator[]} types
 */
function isAnyOfShim(types) {
  const shim = baseShim(async (value) => {
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


module.exports = {
  isAnyOf: isAnyOfShim,
};
