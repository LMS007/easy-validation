function attachOptions(shim: any) {
  let result: any;
  shim.and = (...options: any[]) => {
    const validate = async (value: any, ...args: any[]) => {
      
      result = await shim(value, ...args)
      if (result !== true) {
        return result
      }

      let required = options.filter((v: any) => v && v.hasRequiredCondition == true);
      if(required.length == 0 && value === undefined) {
        // special case for undefined values so they avoid running further conditions.
        return true;
      }

      // ensures high priority conditions are ran first
      // so we resolve things like required before nested objects
      options.sort((v1: any, v2: any) => {
        if (v1.priority > v2.priority) {
          return -1;
        } else {
          return 1;
        }
      })

      for (const validator of options) {
        if (typeof validator !== 'function') {
          throw Error(`Optional condition is not a function: ${args}`)
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

export {
  attachOptions
}