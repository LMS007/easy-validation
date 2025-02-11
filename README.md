# Simple Javascript Object & JSON Validator

This package is a light weight schema validator useful for asserting keys and types inside an object or a JSON response often from an HTTP requests. You can reject requests which have incomplete or malformed payloads before passing that data along to other parts of the system. Its also useful for giving users feedback about what is malformed.


## Simple example

```js
import v from 'easy-validation'


const schema = {
  id: v.isNumeric.isRequired,
  name: v.isString.isRequired,
  attributes: {
   height: v.isNumeric,
   weight: v.isNumeric,
   age: v.isInteger,
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


## Types and modifiers

```js
isBoolean
  .isRequired

isNumeric
  .limit(lower, upper)
  .isRequired  

isInteger  
  .limit(lower, upper)
  .isRequired

isString
  .oneOf(['enum1', 'enum2', ...])
  .condition((value)=>(true || "error message"))
    // condition func example: (v)=>(v === "hello world" ? true : false)
    // condition can also be async
  .isRequired

isFunction
  .isRequired

isObject
  .ofShape({
     prop1: <type>, ...
  })
  .isRequired

isArray
  .ofType( <type> )
  )

oneOfType([
  <type1>, <type2>, ....
])

isCustom(async value=>(true || "error message"))
  .isRequired
```

### Object literal vs `isObject`

There is one special caveat. An object literal is the same as calling `isObject` with one difference: `isObject` can attach the `.isRequired` condition where the object literal can not.

```js
import {isNumber, isString, isObject} from 'easy-validation'

var schema1 = {
  name: isString,
  props: {
    x: isNumber,
    y: isNumber,
    z: isNumber,
  }
}

var schema2 = {
  name: isString,
  props: isObject.ofShape({
    x: isNumber,
    y: isNumber,
    z: isNumber,
  }).isRequired
}

```

Both will validate the props the same, but if the `props` object was omitted, schema1 would not provide an error but schema2 would.

## Wildcards

In rear cases it might be helpful to create a schema for uuids or unknown key values. In this case we might not know the keys inside the `ids` object. In this case we can use a wildcard schema



> Note: You can not have any sibling schema keys alongside a wildcard. It must be the only key in an object schema.

```js
import v from 'easy-validation'

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
    '*': isObject.ofShape({
      name: isString.isRequired
    }).isRequired
  }
}

const result = await v.validateData(schema, sampleData);
```


## A Large Example

```js
import v from 'easy-validation'

const color = {
  red: v.isInteger.limit(0,255).isRequired,
  green: v.isInteger.limit(0,255).isRequired,
  blue: v.isInteger.limit(0,255).isRequired,
  alpha: v.isNumeric.limit(0,1).isRequired,
}

const defaultColor = v.isString.oneOf([
  'red', 
  'blue', 
  'green', 
  'yellow', 
  'black'
]);

const schema = {
  name: v.isString.isRequired,
  description: v.isString,
  colors: v.isArray.ofType(
    // it can be an <r,b,g,a> object or a string
    v.oneOfType([
      color, defaultColor
    ])
  ).isRequired,
  properties: v.isObject.ofShape({
    length: v.isNumeric.limit(0,100).isRequired,
    width: v.isNumeric.limit(0,1000).isRequired,
    height: v.isNumeric.limit(0,100).isRequired,
  }).isRequired
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

const result = await v.validateData(schema, sampleData);
res.status(200).json(result);
```

result:

```json
[
  {"key":"colors.3","error":"value failed to match one of the the allowed types"}
]
```

## Async usage
Use `isString.condition` or `isCustom` to pass async functions to validate values. This is useful for performing a database query to validate an ID for example asynchronously. Note: `isCustom` is more flexible where `isString.condition` must also be a string.

```js
  import v from 'easy-validation'

  async function validateKey() {
    // ...
  }
  async function validateId() {
    // ...
  }
  const schmea = {
    id: v.isCustom(validateKey).isRequired,
    date: v.isString.condition(validateId).isRequired
  }
  const result = await v.validateData(schema, {
    id: 123467,
    key: "1234567"
  });
  
```


### Mapping back to UI fields

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
} catch(e) {
  // transform the array of errors to key:value errors that can be indexed into
  const keyErrors = toKeys(e.response.data)
  
  setValidationErrors(keyErrors); 
}
```

## For Future Support

- custom error messages for each type
- allow nullable types. e.g. `isString.nullable`
