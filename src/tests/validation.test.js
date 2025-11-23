const assert = require('assert').strict;

const { required } = require('../conditions');
const {types, conditions, validateData, toKeys} = require('../index');


describe('shared/type-validation', () => {
  describe('isString', () => {
    it('does not return an error if the value is a string', () => {
      const tt = (types.isString('string'));
      assert.equal(tt, true);
    });

    it('returns an error if the value is not a string', () => {
      assert.equal(types.isString(0), 'value is not a string');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(types.isString(undefined), true);
    });

    it('can not be empty', async () => {
      assert.equal(await types.isString.and(conditions.notEmpty)(''), 'string value can not be empty');
    });

    it('returns true when not empty', async () => {
      assert.equal(await types.isString.and(conditions.notEmpty)('string'), true);
    });

    describe('with required', () => {
      it('does not return an error if the value is not undefined', async () => {
        assert.equal(
          await types.isString.and(conditions.required)('string'), 
          true);
      });

      it('returns an error if the value is undefined', async () => {
        assert.equal(
          await types.isString.and(conditions.required)(undefined),
          'value is required but missing');
      });

      it('can not be empty', async () => {
        assert.equal(
          await types.isString.and(conditions.notEmpty, conditions.required)(''), 
          'string value can not be empty');
      });
  
      it('returns true when not empty', async () => {
        assert.equal(
          await types.isString.and(conditions.notEmpty, conditions.required)('string'), 
          true);
      });
    });

    describe('with inList', () => {
      it('does not return an error if the value is allowed', async () => {
        assert.equal(
          await types.isString.and(conditions.inList(['one', 'two']))('one'), 
          true);
      });

      it('returns an error if the value is not a string', async () => {
        assert.equal(
          await types.isString.and(conditions.inList(['one', 'two']))(0),
          'value is not a string'
        );
      });

      it('returns an error if the value is not allowed', async () => {
        assert.equal(
          await types.isString.and(conditions.inList(['one', 'two']))('three'),
          'value does not match accepted values: [one,two]'
        );
      });

      it('can still be required', async () => {
        assert.equal(
          await types.isString.and(conditions.inList(['one', 'two']), conditions.required)('one'),
          true
        );
      });
    });
  });

  describe('isBoolean', () => {
    it('does not return an error if the value is a boolean', () => {
      assert.equal(types.isBoolean(false), true);
    });

    it('returns an error if the value is not a boolean', () => {
      assert.equal(types.isBoolean(0), 'value is not a boolean');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(types.isBoolean(undefined), true);
    });

    describe('with required', () => {
      it('does not return an error if the value is not undefined', async () => {
        assert.equal(
          await types.isBoolean.and(conditions.required)(false), 
          true);
      });

      it('returns an error if the value is undefined', async () => {
        assert.equal(
          await types.isBoolean.and(conditions.required)(undefined),
          'value is required but missing'
        );
      });
    });
  });
  
  describe('isNumeric', () => {

    it('does not return an error if the value is a number', () => {
      assert.equal(types.isNumeric(1), true);
    });

    it('returns an error if the value is not a number', () => {
      assert.equal(types.isNumeric('1'), 'value is not a number');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(types.isNumeric(undefined), true);
    });

    describe('with required', () => {
      it('does not return an error if the value is not undefined', async () => {
        assert.equal(
          await  types.isNumeric.and(conditions.required)(1), 
          true);
      });

      it('returns an error if the value is undefined', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.required)(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with range', () => {
      it('does not return an error if the value is inside a limit', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(0, 10))(5), 
          true);
      });

      it('returns an error if the value is not a number', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(0, 10))('1'),
          'value is not a number'
        );
      });

      it('returns an error if the value is above a limit', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(0, 10))(11),
          'value falls outside of range (0, 10)'
        );
      });

      it('returns an error if the value is below a limit', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(0, 10))(-1),
          'value falls outside of range (0, 10)'
        );
      });

      it('returns an error if the value is above or equal to an upper limit only', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(undefined, 10))(11),
          'value must be less than or equal to 10'
        );
      });

      it('returns true if the value is below  or equal to an upper limit only', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(undefined, 10))(1),
          true
        );
      });

      it('returns an error if the value is below  or equal to a lower limit only', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(-1, undefined))(-2),
          'value must be greater than or equal to -1'
        );
      });

      it('returns true if the value is above or equal to a lower limit only', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(0, undefined))(0),
          true
        );
      });

      it('returns true if the value is undefined and not required', async () => {
        assert.equal(
          await types.isNumeric.and(conditions.range(0, 100))(undefined),
          true
        );
      });

      it('can still can be required', async () => {
        assert.equal(await types.isNumeric.and(
          conditions.range(0, 10),
          conditions.required)(5), 
        true);
      });
    });
  });
  
  describe('isInteger', () => {
    it('does not return an error if the value is an integer', () => {
      assert.equal(types.isInteger(1), true);
    });

    it('returns an error if the value is not a integer', () => {
      assert.equal(types.isInteger(1.5), 'value is not an integer');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(types.isInteger(undefined), true);
    });

    describe('with required', () => {
      it('does not return an error if the value is not undefined', async () => {
        assert.equal(await types.isInteger.and(conditions.required)(1), true);
      });

      it('returns an error if the value is undefined', async () => {
        assert.equal(
          await types.isInteger.and(conditions.required)(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with limit', () => {
      it('does not return an error if the value is inside a limit', async () => {
        assert.equal(
          await types.isInteger.and(conditions.range(0, 10))(5), 
          true);
      });

      it('returns an error if the value is not an integer', async () => {
        assert.equal(
          await types.isInteger.and(conditions.range(0, 10))(5.5),
          'value is not an integer'
        );
      });

      it('returns an error if the value is above a limit', async () => {
        assert.equal(
          await types.isInteger.and(conditions.range(0, 10))(11),
          'value falls outside of range (0, 10)'
        );
      });

      it('returns an error if the value is below a limit', async () => {
        assert.equal(
          await types.isInteger.and(conditions.range(0, 10))(-1),
          'value falls outside of range (0, 10)'
        );
      });

      it('can still be required', async () => {
        assert.equal(
          await types.isInteger.and(conditions.range(0, 10), conditions.required)(5), 
          true);
      });
    });
  });
  
  describe('isCustom', () => {
    it('runs a custom function and passes', async () => {
      const result = await types.isCustom((v)=>(v === "hello world" ? true : "string does not match"))("hello world")
      assert.equal(result, true);
    });

    it('runs a custom function and fails', async () => {
      const result = await types.isCustom((v)=>(v === "hello world" ? true : "string does not match"))("hello moon")
      assert.equal(result, 'string does not match');
    });

    it('does not return an error if the value is undefined', async () => {
        const custom = (v)=>(v === "hello world" ? true : "string does not match")
        const result = await types.isCustom(custom)(undefined)
        assert.equal(result, true);
      });

    describe('with required', () => {
      it('runs a custom function and passes', async () => {
        const custom = (v)=>(v === "hello world" ? true : "string does not match")
        const result = await types.isCustom(custom).and(conditions.required)("hello world")
        assert.equal(result, true);
      });

      it('returns an error if the value is undefined', async () => {
        const custom = (v)=>(v === "hello world" ? true : "string does not match")
        const result = await types.isCustom(custom).and(conditions.required)(undefined)
        assert.equal(result, 'value is required but missing');
      });
    })

    describe('async', () => {
      it('runs a custom function and passes while waiting 100ms', async () => {
        const wait100 = ()=>{
          return new Promise(resolve=>{
            setTimeout(()=>{
              resolve();
            },100)
          })
        }
        const custom = async (v)=>{
          await wait100();
          return true
        }
        const result = await types.isCustom(custom)("hello world")
        assert.equal(result, true);
      });
    })
  });
  
  describe('isFunction', () => {
    it('does not return an error if the value is a function', () => {
      assert.equal(
        types.isFunction(() => { }),
        true
      );
    });

    it('returns an error if the value is not a function', () => {
      assert.equal(types.isFunction(0), 'value is not a function');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(types.isFunction(undefined), true);
    });

    describe('with required', () => {
      it('does not return an error if the value is not undefined', async () => {
        assert.equal(
          await types.isFunction.and(conditions.required)(() => { }),
          true
        );
      });

      it('returns an error if the value is undefined', async () => {
        assert.equal(
          await types.isFunction.and(conditions.required)(undefined),
          'value is required but missing'
        );
      });
    });
  });

  
  describe('isArray', () => {
    it('does not return an error if the value is an array', () => {
      assert.equal(types.isArray([]), true);
    });

    it('returns an error if the value is not an array', () => {
      assert.equal(types.isArray(0), 'value is not an array');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(types.isArray(undefined), true);
    });

    describe('with required', () => {
      it('does not return an error if the value is not undefined', async () => {
         assert.equal(
          await types.isArray.and(conditions.required)([]), 
          true);
      });

      it('returns an error if the value is undefined', async () => {
        assert.equal(
          await types.isArray.and(conditions.required)(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with range', () => {
      it('does not return an error if the size is within the limits', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(0,1))([1]), 
          true);
      });
      it('returns an error if the size is over the limits', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(0,1))([1,2]), 
          'array size falls outside of range (0, 1)');
      });
      it('returns an error if the size is under the limits', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(1,2))([]), 
          'array size falls outside of range (1, 2)');
      });
      it('isRequired still works', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(0,1), conditions.required)([1]), 
          true);
      });
      it('isRequired still works', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(0,1), conditions.required)([1,2]),
          'array size falls outside of range (0, 1)');
      });

      it('returns an error if the size is above an upper limit only', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(undefined,2), conditions.required)([1,2,3]),
          'array size must be less than or equal to 2'
        );
      });

      it('returns true if the size is below an upper limit only', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(undefined,2), conditions.required)([1,2]),
          true
        );
      });

      it('returns an error if the value is below a lower limit only', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(3, undefined), conditions.required)([1,2]),
          'array size must be greater than or equal to 3'
        );
      });

      it('returns true if the size is above a lower limit only', async () => {
        assert.equal(
          await types.isArray.and(conditions.range(3, undefined), conditions.required)([1,2,3]),
          true
        );
      });

    });

    describe('with ofType', () => {
      it('returns multiple errors for each item into the array which fails to match the type', async () => {
        const shape = {
          foo: types.isString.and(conditions.required),
          bar: types.isString.and(conditions.required),
          cool: types.isObject.and(
            conditions.ofShape({
              hot: types.isString.and(conditions.required),
              warm: types.isString.and(conditions.notEmpty)
            }),
            conditions.required
          )
        }
        const result = (await types.isArray.and(conditions.ofType(shape))([
          { fo2o: '1', b2ar: 'string' },
          { foo: '2', b2ar: 'string' },
          { foo: '3', bar: 'string' },
          { foo: '4', bar: 'string', cool: { warm: '' },},
          { foo: '5', bar: 'string', cool: { warm: 'yes', hot: 'string' } }, // last one okay
        ]))

        assert.deepEqual(result,
          [
            { key: '0.foo', error: 'value is required but missing' },
            { key: '0.bar', error: 'value is required but missing' },
            { key: '0.cool', error: 'value is required but missing' },
            { key: '0.fo2o', error: 'extraneous key found' },
            { key: '0.b2ar', error: 'extraneous key found' },
            { key: '1.bar', error: 'value is required but missing' },
            { key: '1.cool', error: 'value is required but missing' },
            { key: '1.b2ar', error: 'extraneous key found' },
            { key: '2.cool', error: 'value is required but missing' },
            { key: '3.cool.hot', error: 'value is required but missing' },
            { key: '3.cool.warm', error: 'string value can not be empty' }
          ]);
      });

      it('does not return an error if the array is of the specified type', async () => {
        assert.equal(
          await types.isArray.and(
            conditions.ofType(types.isNumeric))([1]),
          true
        );
      });

      it('does not return an error if the array is empty', async () => {
        assert.equal(
          await types.isArray.and(
            conditions.ofType(types.isNumeric))([]), 
          true);
      });

      it('returns an error if the value of the array is not of the specified type', async () => {
        assert.deepEqual(
          await types.isArray.and(
            conditions.ofType(types.isNumeric))([false]),
          [{ error: 'value is not a number', key: '0' }]
        );
      });

      it('returns an error if the value is not an array ', async () => {
        assert.equal(
         await types.isArray.and(
          conditions.ofType(types.isNumeric))(false),
          'value is not an array'
        );
      });

      it('can still be required', async () => {
        // Allow empty arrays even with ofType condition.
        assert.equal(
          await types.isArray.and(
            required,
            conditions.ofType(types.isNumeric)
          )([]),
          true
        );
      });

      it('can still add limit and required', async () => {
        assert.equal(
          await types.isArray.and(
            conditions.ofType(types.isNumeric),
            conditions.range(0,10),
            conditions.required
          )([4]),
          true
        );
      });

      it('can still still be omitted', async () => {
        // Allow undefined even with ofType condition.
        assert.equal(
          await types.isArray.and(
            conditions.ofType(types.isNumeric)
          )(undefined),
          true
        );
      });
    });
  });
  
  describe('isObject', () => {
    it('does not return an error if the value is an array', () => {
      assert.equal(types.isObject({}), true);
    });

    it('returns an error if the value is not an object', () => {
      assert.equal(types.isObject(0), 'value is not an object');
      assert.equal(types.isObject([]), 'value is not an object');
      assert.equal(types.isObject(null), 'value is not an object');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(types.isObject(undefined), true);
    });

    describe('with required', () => {
      it('does not return an error if the value is not undefined', async () => {
        assert.equal(await types.isObject.and(conditions.required)({}), true);
      });

      it('returns an error if the value is undefined', async () => {
        assert.equal(
          await types.isArray.and(conditions.required)(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with ofShape', () => {
      const shape = {
        a: types.isBoolean,
        b: {
          c: types.isString,
          d: types.isString.and(conditions.required),
        },
      };

      it('does not return an error if the shape matches the schema', async () => {
        const data = {
          a: true,
          b: {
            c: 'string 1',
            d: 'string 2',
          },
        };
        assert.equal(await types.isObject.and(conditions.ofShape(shape))(data), true);
      });

      it('returns an error if the shape does not match the schema', async () => {
        const data = {
          a: true,
          b: {
            c: true, // invalid type
            // d is missing
          },
        };
        assert.deepEqual(await types.isObject.and(conditions.ofShape(shape))(data), [
          {
            key: 'b.c',
            error: 'value is not a string',
          },
          {
            key: 'b.d',
            error: 'value is required but missing',
          },
        ]);
      });

      it('returns an error if the value is not an object', async () => {
        assert.equal(
          await types.isObject.and(conditions.ofShape(shape))(0),
          'value is not an object'
        );
      });

      it('can still be required', async () => {
        const data = {
          a: true,
          b: {
            c: 'string 1',
            d: 'string 2',
          },
        };
        assert.equal(
          await types.isObject.and(
            conditions.ofShape(shape),
            conditions.required)(data),
          true);
      });
    });
  });

  describe('isAnyOf', () => {
    it('does not return an error if the value matches an allowed type', async () => {
      assert.equal(
        await types.isAnyOf([types.isBoolean, types.isString])(
          'string'
        ),
        true
      );
    });

    // both object schemas in the array below are equivalent  
    [
      { foo: types.isString.and(conditions.required) },
      types.isObject.and(conditions.ofShape({ foo: types.isString.and(conditions.required) }))
    ].forEach(objectSchema => {
      it('does not return an error if the value matches an allowed type of object', async () => {
        assert.equal(
          await types.isAnyOf([objectSchema])(
            { foo: "string" }
          ),
          true
        );
      });
    });

    // both object schemas in the array below are equivalent  
    [
      { foo: types.isString.and(conditions.required) },
      types.isObject.and(conditions.ofShape({ foo: types.isString.and(conditions.required) }))
    ].forEach(objectSchema => {
      it('returns an error if the value matches an allowed type of object', async () => {
        assert.equal(
          await types.isAnyOf([objectSchema])(
            {}
          ),
          'value failed to match one of the the allowed types'
        );
      });
    });

    it('returns an error if the value does not match an allowed type', async () => {
      assert.equal(
        await types.isAnyOf([types.isBoolean, types.isString])(1),
        'value failed to match one of the the allowed types'
      );
    });

    it('does not return an error if the value is undefined', async () => {
      assert.equal(
        await types.isAnyOf([types.isBoolean, types.isString])(
          undefined
        ),
        true
      );
    });

    describe('with required', () => {
      it('does not return an error if the value is not undefined', async () => {
        assert.equal(
          await types
            .isAnyOf([types.isBoolean, types.isString])
            .and(conditions.required)
          ('string'),
          true
        );
      });

      it('returns an error if the value is undefined', async () => {
        assert.equal(
          await types
            .isAnyOf([types.isBoolean, types.isString])
            .and(conditions.required)
          (undefined),
          'value is required but missing'
        );
      });
    });
  });
  
  describe('validateData', () => {
    [
      {
        data: {},
        result: true,
      },
      {
        data: { varA: true },
        result: true,
      },
      {
        data: {
          varA: true,
          b: {},
        },
        result: true,
      },
      {
        data: {
          varA: true,
          b: {
            varB: true,
          },
        },
        result: true,
      },
      {
        data: {
          b: {
            c: {
              varC: true,
            },
          },
        },
        result: true,
      },
      {
        data: {
          b: {
            c: {
              varC: 'true',
            },
          },
        },
        result: [
          {
            error: 'value is not a boolean',
            key: 'b.c.varC',
          },
        ],
      },
      {
        data: {
          varA: 'true',
          b: {
            varB: 'true',
            c: {
              varC: 'true',
            },
          },
        },
        result: [
          {
            error: 'value is not a boolean',
            key: 'varA',
          },
          {
            error: 'value is not a boolean',
            key: 'b.varB',
          },
          {
            error: 'value is not a boolean',
            key: 'b.c.varC',
          },
        ],
      },
    ].forEach(test => {
      it('validates the follow data', async () => {
        let schema = {
          varA: types.isBoolean,
          b: {
            varB: types.isBoolean,
            c: {
              varC: types.isBoolean,
            },
          },
        };
        assert.deepEqual(
          await validateData(schema, test.data),
          test.result
        );
      });
    });

    describe('with required', () => {
      const schema = {
        varA: types.isBoolean,
        b: {
          varB: types.isBoolean,
          c: {
            varC: types.isBoolean.and(conditions.required),
          },
        },
      };

      it('does not require a value if parent is undefined', async () => {
        const data = {
          varA: true,
          b: {
            varB: true,
            // c is missing
          },
        };
        assert.deepEqual(await validateData(schema, data), true);
      });

      it('requires a value if its parent is defined', async () => {
        const schema = {
          b: {
            c: {
              varC: types.isBoolean.and(conditions.required),
            },
          },
        };

        const data = {
          b: {
            c: {}
          },
        };

        assert.deepEqual(await validateData(schema, data), [
          {
            error: 'value is required but missing',
            key: 'b.c.varC',
          },
        ]);
      });
    });

    describe('edge cases', () => {
      it('rejects array when object is expected and not passed', async () => {
        const schema = {
          b: {
            c: {},
          },
        };

        const data = {
          b: {
            c: []
          },
        };

        assert.deepEqual(await validateData(schema, data), [
          {
            error: 'value is not an object',
            key: 'b.c',
          },
        ]);
      });

      it('can accept function based schema', async () => {
        const schema = types.isObject.and(
          conditions.ofShape({
            b: {
              c: {
                varC: types.isBoolean.and(conditions.required),
              }
            }
          }), 
          conditions.required
        )

        const data = {
          b: {
            c: {}
          },
        };

        assert.deepEqual(await validateData(schema, data), [
          { key: 'b.c.varC', error: 'value is required but missing' }
        ]);
      });

      it('can validate a single function as schema', async () => {
        const schema = types.isString
        const data = '5'
        assert.equal(await validateData(schema, data), true);
      });

      it('rejects a single custom function as schema', async () => {
        const schema = types.isCustom(async ()=>('test fail'))
        assert.equal(await validateData(schema, {}), 'test fail');
      });
    });


    describe('extraneous key values', () => {
      it('should return errors for extra values not found in the schema', async () => {
        const data = {
          extraneous: 'hello',
        };
        let schema = {
          varA: types.isBoolean,
          b: {
            varB: types.isBoolean,
            c: {
              varC: types.isBoolean,
            },
          },
        };
        assert.deepEqual(
          await validateData(schema, data),
          [{ key: 'extraneous', error: 'extraneous key found' }]
        );
      });

      it('should not return errors for extra values not found in the schema', async () => {
        const schema = { myObject: { bar: types.isBoolean } };
        const data = {
          myValue: true,
          myArray: [],
          myObject: {
            foo: false,
            bar: true
          }
        }
        const result = await validateData(schema, data);
        assert.deepEqual(result, [
          { key: 'myObject.foo', error: 'extraneous key found' },
          { key: 'myValue', error: 'extraneous key found' },
          { key: 'myArray', error: 'extraneous key found' }
        ]);
      });
    });
  });

  describe('a complex example', () => {
    it('toKeys returns key value error pairs', async () => {
      const errors = [
        { key: 'myObject.foo', error: 'extraneous key found' },
        { key: 'myValue', error: 'extraneous key found' },
        { key: 'myArray', error: 'extraneous key found' }
      ]
      const converted = toKeys(errors);
      assert.deepEqual(converted,
        {
          "myObject.foo": "extraneous key found",
          "myValue": "extraneous key found",
          "myArray": "extraneous key found"
        },
      )
    })
    it('returns various errors for incorrect values', async () => {
      const schema = {
        zoo: {
          hours: types.isAnyOf([
            types.isString,
            types.isInteger,
          ]),
          animals: types.isArray.and(
            conditions.ofType({
              age: types.isInteger.and(conditions.required),
              snake: types.isAnyOf([
                types.isString,
                types.isBoolean,
                {
                  food: types.isObject.and(
                    conditions.ofShape({
                      rat: types.isBoolean
                    }),
                    conditions.required
                  )
                },
              ]).and(conditions.required)
          }))
        },
      };

      const data = {
        zoo: {
          hours: 4.5,
          animals: [{ snake: { food: { rat: true } } }, { age: 4, snake: "happy" }, { age: 4, snake: 50 }],
        },
      };
      const result = await validateData(schema, data);
      assert.deepEqual(result, [
        {
          key: 'zoo.hours', error: 'value failed to match one of the the allowed types'
        },
        { key: 'zoo.animals.0.age', error: 'value is required but missing' },
        {
          key: 'zoo.animals.2.snake', error: 'value failed to match one of the the allowed types'
        }
      ]);
    });
  })

  describe('wildcard tests', () => {
    it("can't have siblings", async () => {
      try {
        const schema = { 
          a: {
            'c': {},
            '*': {
              c: types.isNumeric,
            }
          }
        };
        const result = await validateData(schema, {a:{'1234': {}}});
        throw new Error('failed to throw error')
      }catch(e) {
        assert.equal(e.message, 'Schema wildcard conflict. A wildcard can not have sibling keys')
      }
    })
    it('can handle wildcards', async () => {
      const data = {
        a: {
          '101': {},
          '102': {}
        }
      }
      const schema = { 
        a: {
          '*': {
            c: types.isNumeric,
          }
        }
      };
      const result = await validateData(schema, data);
      assert.equal(true, result)
    })
  })
});
