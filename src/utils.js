/**
 * Additional conditions added to the type shim
 * @param {function} shim 
 */
function attachOptions(shim /*, validOptions*/) {
  let result;
  shim.and = (...options) => {
    const validate = async (value, ...args) => {
      result = await shim(value, ...args)
      if (result !== true) {
        return result
      }

      // ensures high priority conditions are ran first
      // so we resolve things like required before nested objects
      options.sort((v1, v2)=>{
        if (v1.priority > v2.priority) {
          return -1;
        } else {
          return 1;
        }
      })

      for (const validator of options) {
        if (typeof validator !== 'function') {
          throw Error(`Optional condition is not a function`)
        }
        result = await validator(value, ...args)
        if (result !== true) {
          break;
        }
      }
      return result
    }
    return validate;
  }
}


module.exports = {
  attachOptions
}