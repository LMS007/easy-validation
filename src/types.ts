/** Function that validates a value and returns true or an error message */
export type ValidatorFunction = (value: any, ...args: any[]) => any;

/** Properties that can be attached to a validator */
export interface ValidatorProperties {
  required?: boolean;
  conditions?: any[];
}

/** A validator function with optional attached properties */
export type Validator = ValidatorFunction & ValidatorProperties;

/** Error object returned when validation fails */
export interface ValidationError {
  key: string;
  error: string;
}
