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

> Note: To use the results in a UI such as in a React frontend app, its helpful to use `toKeys()` to convert the array of errors to a key value map. See [Mapping back to UI fields](#mapping-back-to-ui-fields) below.
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

## A Larger Example

This is a more complete sample of what the API might look like in practice.

```js
const {types, conditions, validateData} = require('./src/index');

const color = {
  red: types.isInteger.and(conditions.range(0,255), conditions.required),
  green: types.isInteger.and(conditions.range(0,255), conditions.required),
  blue: types.isInteger.and(conditions.range(0,255), conditions.required),
  alpha: types.isNumeric.and(conditions.range(0,1), conditions.required),
}

const defaultColor = types.isString.and(conditions.inList([
  'red', 
  'blue', 
  'green', 
  'yellow', 
  'black'
]));

const schema = {
  name: types.isString.and(conditions.required),
  description: types.isString,
  colors: types.isArray.and(conditions.ofType(
    types.isAnyOf([
      // array items can be a color or enumerated string
      color, 
      defaultColor]) 
    ),
    conditions.required
  ),
  properties: types.isObject.and(
    conditions.ofShape({
      length: types.isNumeric.and(conditions.range(0,100), conditions.required),
      width: types.isNumeric.and(conditions.range(0,100), conditions.required),
      height: types.isNumeric.and(conditions.range(0,100), conditions.required),
    }),
    conditions.required
  )
}

const sampleData = {
  name: "mycolor",
  colors: [{red:100, green:255, blue:0, alpha: 0.5}, 'yellow', 'black', 'orange'],
  properties: {
    length: 5.5,
    width: 20.1,
    height: 55.9
  }
}

const result = await validateData(schema, sampleData);
res.status(200).json(result);
```

result:

```json
[
  {
    "key":"colors.3",
    "error":"value failed to match one of the the allowed types"
  }
]
```

## Asynchronous usage and custom conditions
Use `isCustom` to pass asynchronous functions to value validation. This is useful for performing a database query to validate an ID asynchronously. Alternatively you may also create any custom condition you wish and add it to the `and()` parameters for a given type. Conditions are asynchronously by nature too.

```js
  const {types, conditions, validateData} = require('./src/index');

  async function validateKey(value) {
    try {
      await myLookupFunction(value); // this could be a lookup in a database for example
      return true;
    }
    catch (e) {
      return `value ${value} not found`
    }

  }
  const schmea = {
    id: types.isCustom(validateKey).and(conditions.required),
  }
  const result = await validateData(schema, {
    id: 123467
  });
  
```


## Mapping back to UI fields

In many cases, it is helpful to map errors back to UI fields of nested properties. However, using an array of errors in such cases is not ideal. To simplify this process, we can convert the array into key-value pairs since all keys are unique.

In the partial example below, the error will be displayed when returned from the service; otherwise, it will not. This approach can also work for arrays, as the array index is reported back. You can further enhance this by creating encapsulated validation components for form fields.

### React example:

```jsx
import { toKeys } from 'easy-validation'

const [fields setFields]  = useState({})
const [validationErrors setValidationErrors]  = useState({})

...

<form>
  ...
  <div>
    <label for="my-height-field">Height</label>
    <input id="my-height-field" type="text" defaultValue={fields.attributes.height}>
    <span style={{color: 'red'}}>{validationErrors['attributes.height'] || ''}</span>
  </div>
  ...
</form>

... 

try {
  // some API endpoint that validates the payload
  await this.$axios.$post("...", fields);
} catch(err) {
  // transform the array of errors to key:value errors that can be indexed into
  const keyErrors = toKeys(err.response.data)
  
  setValidationErrors(keyErrors); 
}
```

## Future Enhancements

- Custom error messages for each type
- Support for nullable types
- Add safeString condition 
- Add support for data translators

