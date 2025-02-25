# Simple Javascript Object & JSON Validator

This package is a light weight schema validator useful for asserting keys and types inside an object or a JSON response often from an HTTP requests. You can reject requests which have incomplete or malformed payloads before passing that data along to other parts of the system. Its also useful for giving users feedback about what is malformed. This package pairs especially well with MongoDB where after you validate, you can directly insert the JSON objects into the database with confidence.


## Simple example

```js
import {validateData, types, conditions} from 'easy-validation'


const schema = {
  id: types.isNumeric.and(conditions.required),
  name: types.isString.and(conditions.required),
  attributes: {
   height: types.isNumeric,
   weight: types.isNumeric,
   age: types.isInteger,
  }
};

router.post("/test", async (req, res) => {
   const result = await v.validateData(schema, req.body)
   if (result !== true) {
      res.status(400).json(result);
      return;
   }
     
   // do action ...
     
   res.status(200).text("success");
  }
);

```

### Sample request and responses:

The validation result is either `true` or an array of errors. Each error has a unique key and an error message

### Example 1: 
method: `POST`, body: `{}`

```json
[
  {"key":"id","error":"value is required but missing"},
  {"key":"name","error":"value is required but missing"}
]
```

### Example 2: 
method: `POST`, body: `{"id":"10","name":"me","attributes":{"height":"20","weight":"hello"}}`

```json
[
  {"key":"id","error":"value is not a number"},
  {"key":"attributes.height","error":"value is not a number"},
  {"key":"attributes.weight","error":"value is not a number"}
]
```

### Example 3: 
method `POST`, body `{"id":10,"name":"me","attributes":{"height":20,"weight":0}}`

```
success
```


## Types and conditions

All schema values must resolve to a `type`. Optionally each type may have one or more `conditions` attached using the `and()` function to further distinguish what that type can be.

_For example, you might want a string, but the string should also not be empty and must be be required (e.g not missing)--that can all be done with conditions._

e.g. 
  ```ts
  const schema = types.isString.and(conditions.notEmpty, conditions.required);
  const result = validateData(schema, "hello world");
  ```

### Types

- ```
  isBoolean
  ```
- ```
  isNumeric
  ```
- ```
  isInteger
  ```
- ```
  isString
  ```
- ```
  isFunction
  ```
- ```
  isObject
  ```
- ```
  isArray
  ```
- ```ts
  isAnyOf([
    parm1: type, parm2: type, ....
  ])
  ```
- ```ts
  isCustom((value: any) => true | "error message")
  .isRequired
  ```


### Conditions

- ```ts
  required
  ```
- ```ts
  // for string types only
  notEmpty
  ```
- ```ts
  // for array or number types only
  range(lowerLimit: number, upperLimit: number)
  ```
- ```ts
  // for string types only
  inList([string1: string, string2: string, ...]) 
  ```
- ```ts
  // for array types only
  ofType(type)
  ```
- ```ts
  // for object types only
  ofShape(shape: object | typeof isObject)  
  ```
### Object literal vs `isObject`

There is one special caveat. An object literal is the same as calling `isObject` with one difference: `isObject` can attach additional conditions where as an object literal only gives you the shape. For example:

```js
import {types, conditions, validateData} from 'easy-validation'

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
    conditions.required) // this is different!
}

const data = {};

await validateData(schema1, data) // true
await validateData(schema2, data) // [{ key: 'props', error: 'value is required but missing' }],
```

Both will validate the props the same, but if the `props` object was omitted, then schema1 would not provide an error but schema2 would.

## Wildcards

In some cases it might be helpful to create a schema for uuids or unknown key values. In this case we might not know the keys inside the `ids` object and so we can use a wildcard. This could be useful for being able to access data in `Big O(1)` time by an `id` rather than searching for it in an array structure.



> Note: You can not have any sibling schema keys alongside a wildcard. It must be the only key in an object schema.

```js
import {conditions, types, validateData} from 'easy-validation'

const sampleData = {
  ids: {
    '1001' : {
      name: 'name1'
      
    },
    '1002' : {
      name: 'name2'
    }, //...
  }
}

const schema = {
  'ids': {
    '*': types.isObject.and(
      conditions.ofShape({
        name: isString.isRequired
      }),
      conditions.required
      )
  }
}

const result = await validateData(schema, sampleData);
```


## A Larger Example
Lets try to validate an ob
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

## Async usage
Use `isCustom` to pass async functions to value validation. This is useful for performing a database query to validate an ID asynchronously. 

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

In many cases its helpful to map errors back to UI fields of nested properties. In these cases having an array of errors is not ideal. To make things easier, we can map the array to key value pairs since all the keys are unique.
In this partial example below, the error will render when returned from the service, otherwise it won't.  _This could even work for arrays of things since the array's index is reported back._ You can take this further by crafting encapsulated validation components for fields.

React example:

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

## For Future Support

- custom error messages for each type
- allow nullable types. e.g. `isString.nullable`
