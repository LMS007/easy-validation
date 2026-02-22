import * as basicTypes from './types-basic'
import * as complexTypes from './types-complex'
import * as conditions from './conditions'
import * as validation from './validation'

// Re-export types for consumers
export type { Validator, ValidatorFunction, ValidatorProperties, ValidationError } from './types'

const types = {
  ...basicTypes,
  ...complexTypes
};

const lib = {
  ...validation,
  types,
  conditions,
};

export default lib;
export const { validateData, toKeys } = validation;
export { types, conditions };
