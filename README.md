# Simple JavaScript Object & JSON Validator

This package is a lightweight schema validator that is useful for asserting keys and types inside an object or a JSON response, often from HTTP requests. It allows you to reject requests with incomplete or malformed payloads before passing the data along to other parts of the system. It is also helpful for providing users with feedback about what is malformed. 

This package pairs especially well with MongoDB because, after validation, you can confidently insert the JSON objects into the database.

## Simple Example

```js
import { validateData, types, conditions } from 'easy-validation';

const schema = {
  id: types.isNumeric.and(conditions.required),
  name: types.isString.and(conditions.required),
  attributes: {
    height: types.isNumeric,
    weight: types.isNumeric,
    age: types.isInteger,
  },
};

router.post("/test", async (req, res) => {
  const result = await validateData(schema, req.body);
  
  if (result !== true) {
    res.status(400).json(result);
    return;
  }

  // Perform an action ...

  res.status(200).send("success");
});
```

### Sample Requests and Responses

The validation result is either `true` or an array of errors. Each error contains a unique key and an error message.

#### Example 1: 
**Method:** `POST`  
**Body:** `{}`

```json
[
  {"key": "id", "error": "value is required but missing"},
  {"key": "name", "error": "value is required but missing"}
]
```

#### Example 2: 
**Method:** `POST`  
**Body:** `{"id":"10","name":"me","attributes":{"height":"20","weight":"hello"}}`

```json
[
  {"key": "id", "error": "value is not a number"},
  {"key": "attributes.height", "error": "value is not a number"},
  {"key": "attributes.weight", "error": "value is not a number"}
]
```

#### Example 3: 
**Method:** `POST`  
**Body:** `{"id":10,"name":"me","attributes":{"height":20,"weight":0}}`

```
success
```

## Types and Conditions

All schema values must resolve to a `type`. Optionally, each type may have one or more `conditions` attached using the `and()` function to further specify constraints.

_For example, you may require a string, but it must also be non-empty and mandatory (i.e., not missing). This can all be achieved using conditions._

Example:

```ts
const schema = types.isString.and(conditions.notEmpty, conditions.required);
const result = validateData(schema, "hello world");
```

### Available Types

```ts
isBoolean
isNumeric
isInteger
isString
isFunction
isObject
isArray
isAnyOf([
  param1: type, param2: type, ...
])
isCustom((value: any) => true | "error message")
```

### Available Conditions

```ts
// Applicable to all types
required

// Applicable to string types only
notEmpty

// Applicable to array or number types only
range(lowerLimit: number, upperLimit: number)

// Applicable to string types only
inList([string1: string, string2: string, ...]) 

// Applicable to array types only
ofType(type)

// Applicable to object types only
ofShape(shape: object | typeof isObject)  
```

## Object Literals vs. `isObject`

There is a key difference between using an object literal and `isObject`. While an object literal defines the shape, `isObject` allows additional conditions to be attached.

Example:

```js
import { types, conditions, validateData } from 'easy-validation';

const schema1 = {
  name: types.isString,
  props: {
    x: types.isNumber,
    y: types.isNumber,
    z: types.isNumber,
  }
};

const schema2 = {
  name: types.isString,
  props: types.isObject.and(
    conditions.ofShape({
      x: types.isNumber,
      y: types.isNumber,
      z: types.isNumber,
    }),
    conditions.required  // This makes a difference!
  )
};

const data = {};

await validateData(schema1, data); // true
await validateData(schema2, data); // [{ key: 'props', error: 'value is required but missing' }]
```

While both schemas validate the `props` object, if `props` is omitted, `schema1` does not trigger an error, whereas `schema2` does.

## Wildcards

In some cases, it may be helpful to create a schema for UUIDs or unknown key values. A wildcard allows validation of dynamic keys inside an object. This is useful for accessing data in `O(1)` time using an ID instead of searching through an array.

> **Note:** Wildcards must be the only key in an object schema for each respective level.

```js
import { conditions, types, validateData } from 'easy-validation';

const sampleData = {
  ids: {
    '1001': { name: 'name1' },
    '1002': { name: 'name2' }
  }
};

const schema = {
  ids: {
    '*': types.isObject.and(
      conditions.ofShape({
        name: types.isString.and(conditions.required)
      }),
      conditions.required
    )
  }
};

const result = await validateData(schema, sampleData);
```

## Future Enhancements

- Custom error messages for each type
- Support for nullable types
- Add safeString condition 
- Add support for data translators

