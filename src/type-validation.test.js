const assert = require('assert').strict;

const validators = require('./type-validation');


describe('shared/type-validation', () => {
  describe('isString', () => {
    it('does not return an error if the value is a string', () => {
      const tt = (validators.isString('string'));
      assert.equal(tt, true);
    });

    it('returns an error if the value is not a string', () => {
      assert.equal(validators.isString(0), 'value is not a string');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(validators.isString(undefined), true);
    });

    describe('with isRequired', () => {
      it('does not return an error if the value is not undefined', () => {
        assert.equal(validators.isString.isRequired('string'), true);
      });

      it('returns an error if the value is undefined', () => {
        assert.equal(
          validators.isString.isRequired(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with onOne', () => {
      it('does not return an error if the value is allowed', () => {
        assert.equal(validators.isString.oneOf(['one', 'two'])('one'), true);
      });

      it('returns an error if the value is not a string', () => {
        assert.equal(
          validators.isString.oneOf(['one', 'two'])(0),
          'value is not a string'
        );
      });

      it('returns an error if the value is not allowed', () => {
        assert.equal(
          validators.isString.oneOf(['one', 'two'])('three'),
          'value does not match accepted values: [one,two]'
        );
      });

      it('can still be required', () => {
        assert.equal(
          validators.isString.oneOf(['one', 'two']).isRequired('one'),
          true
        );
      });
    });
  });

  describe('isBoolean', () => {
    it('does not return an error if the value is a boolean', () => {
      assert.equal(validators.isBoolean(false), true);
    });

    it('returns an error if the value is not a boolean', () => {
      assert.equal(validators.isBoolean(0), 'value is not a boolean');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(validators.isBoolean(undefined), true);
    });

    describe('with isRequired', () => {
      it('does not return an error if the value is not undefined', () => {
        assert.equal(validators.isBoolean.isRequired(false), true);
      });

      it('returns an error if the value is undefined', () => {
        assert.equal(
          validators.isBoolean.isRequired(undefined),
          'value is required but missing'
        );
      });
    });
  });

  describe('isNumeric', () => {
    it('does not return an error if the value is a number', () => {
      assert.equal(validators.isNumeric(1), true);
    });

    it('returns an error if the value is not a number', () => {
      assert.equal(validators.isNumeric('1'), 'value is not a number');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(validators.isNumeric(undefined), true);
    });

    describe('with isRequired', () => {
      it('does not return an error if the value is not undefined', () => {
        assert.equal(validators.isNumeric.isRequired(1), true);
      });

      it('returns an error if the value is undefined', () => {
        assert.equal(
          validators.isNumeric.isRequired(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with limit', () => {
      it('does not return an error if the value is inside a limit', () => {
        assert.equal(validators.isNumeric.limit(0, 10)(5), true);
      });

      it('returns an error if the value is not a number', () => {
        assert.equal(
          validators.isNumeric.limit(0, 10)('1'),
          'value is not a number'
        );
      });

      it('returns an error if the value is above a limit', () => {
        assert.equal(
          validators.isNumeric.limit(0, 10)(11),
          'value falls outside of range (0, 10)'
        );
      });

      it('returns an error if the value is below a limit', () => {
        assert.equal(
          validators.isNumeric.limit(0, 10)(-1),
          'value falls outside of range (0, 10)'
        );
      });

      it('can still can required', () => {
        assert.equal(validators.isNumeric.limit(0, 10).isRequired(5), true);
      });
    });
  });

  describe('isInteger', () => {
    it('does not return an error if the value is an integer', () => {
      assert.equal(validators.isInteger(1), true);
    });

    it('returns an error if the value is not a integer', () => {
      assert.equal(validators.isInteger(1.5), 'value is not an integer');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(validators.isInteger(undefined), true);
    });

    describe('with isRequired', () => {
      it('does not return an error if the value is not undefined', () => {
        assert.equal(validators.isInteger.isRequired(1), true);
      });

      it('returns an error if the value is undefined', () => {
        assert.equal(
          validators.isInteger.isRequired(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with limit', () => {
      it('does not return an error if the value is inside a limit', () => {
        assert.equal(validators.isInteger.limit(0, 10)(5), true);
      });

      it('returns an error if the value is not an integer', () => {
        assert.equal(
          validators.isInteger.limit(0, 10)(5.5),
          'value is not an integer'
        );
      });

      it('returns an error if the value is above a limit', () => {
        assert.equal(
          validators.isInteger.limit(0, 10)(11),
          'value falls outside of range (0, 10)'
        );
      });

      it('returns an error if the value is below a limit', () => {
        assert.equal(
          validators.isInteger.limit(0, 10)(-1),
          'value falls outside of range (0, 10)'
        );
      });

      it('can still be required', () => {
        assert.equal(validators.isInteger.limit(0, 10).isRequired(5), true);
      });
    });
  });

  describe('isFunction', () => {
    it('does not return an error if the value is a function', () => {
      assert.equal(
        validators.isFunction(() => { }),
        true
      );
    });

    it('returns an error if the value is not a function', () => {
      assert.equal(validators.isFunction(0), 'value is not a function');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(validators.isFunction(undefined), true);
    });

    describe('with isRequired', () => {
      it('does not return an error if the value is not undefined', () => {
        assert.equal(
          validators.isFunction.isRequired(() => { }),
          true
        );
      });

      it('returns an error if the value is undefined', () => {
        assert.equal(
          validators.isFunction.isRequired(undefined),
          'value is required but missing'
        );
      });
    });
  });

  describe('isArray', () => {
    it('does not return an error if the value is an array', () => {
      assert.equal(validators.isArray([]), true);
    });

    it('returns an error if the value is not an array', () => {
      assert.equal(validators.isArray(0), 'value is not an array');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(validators.isArray(undefined), true);
    });

    describe('with isRequired', () => {
      it('does not return an error if the value is not undefined', () => {
        assert.equal(validators.isArray.isRequired([]), true);
      });

      it('returns an error if the value is undefined', () => {
        assert.equal(
          validators.isArray.isRequired(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with ofType', () => {
      it('returns multiple errors for each item into the array which fails to match the type', () => {
        const schema = {
          foo: validators.isString.isRequired,
          bar: validators.isString.isRequired,
          cool: validators.isObject.ofShape({
            hot: validators.isString.isRequired
          }).isRequired
        }
        const result = (validators.isArray.ofType(schema)([
          { fo2o: '1', b2ar: 'string' },
          { foo: '2', b2ar: 'string' },
          { foo: '3', bar: 'string' },
          { foo: '4', bar: 'string', cool: {} },
          { foo: '5', bar: 'string', cool: { hot: 'string' } }, // last one okay
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
            { key: '3.cool.hot', error: 'value is required but missing' }
          ]);
      });

      it('does not return an error if the array is of the specified type', () => {
        assert.equal(
          validators.isArray.ofType(validators.isNumeric)([1]),
          true
        );
      });

      it('does not return an error if the array is empty', () => {
        assert.equal(validators.isArray.ofType(validators.isNumeric)([]), true);
      });

      it('returns an error if the value of the array is not of the specified type', () => {
        assert.deepEqual(
          validators.isArray.ofType(validators.isNumeric)([false]),
          [{ error: 'value is not a number', key: '0' }]
        );
      });

      it('returns an error if the value is not an array ', () => {
        assert.equal(
          validators.isArray.ofType(validators.isNumeric)(false),
          'value is not an array'
        );
      });

      it('can still be required', () => {
        // Allow empty arrays even with ofType condition.
        assert.equal(
          validators.isArray.ofType(validators.isNumeric).isRequired([]),
          true
        );
      });
    });
  });

  describe('isObject', () => {
    it('does not return an error if the value is an array', () => {
      assert.equal(validators.isObject({}), true);
    });

    it('returns an error if the value is not an object', () => {
      assert.equal(validators.isObject(0), 'value is not an object');
      assert.equal(validators.isObject([]), 'value is not an object');
      assert.equal(validators.isObject(null), 'value is not an object');
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(validators.isObject(undefined), true);
    });

    describe('with isRequired', () => {
      it('does not return an error if the value is not undefined', () => {
        assert.equal(validators.isObject.isRequired({}), true);
      });

      it('returns an error if the value is undefined', () => {
        assert.equal(
          validators.isArray.isRequired(undefined),
          'value is required but missing'
        );
      });
    });

    describe('with ofShape', () => {
      const shape = {
        a: validators.isBoolean,
        b: {
          c: validators.isString,
          d: validators.isString.isRequired,
        },
      };

      it('does not return an error if the shape matches the schema', () => {
        const data = {
          a: true,
          b: {
            c: 'string 1',
            d: 'string 2',
          },
        };
        assert.equal(validators.isObject.ofShape(shape)(data), true);
      });

      it('returns an error if the shape does not match the schema', () => {
        const data = {
          a: true,
          b: {
            c: true, // invalid type
            // d is missing
          },
        };
        assert.deepEqual(validators.isObject.ofShape(shape)(data), [
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

      it('returns an error if the value is not an object', () => {
        assert.equal(
          validators.isObject.ofShape(shape)(0),
          'value is not an object'
        );
      });

      it('can still be required', () => {
        const data = {
          a: true,
          b: {
            c: 'string 1',
            d: 'string 2',
          },
        };
        assert.equal(validators.isObject.ofShape(shape).isRequired(data), true);
      });
    });
  });

  describe('oneOfType', () => {
    it('does not return an error if the value matches an allowed type', () => {
      assert.equal(
        validators.oneOfType([validators.isBoolean, validators.isString])(
          'string'
        ),
        true
      );
    });

    // both object schemas in the array below are equivalent  
    [
      { foo: validators.isString.isRequired },
      validators.isObject.ofShape({ foo: validators.isString.isRequired })
    ].forEach(objectSchema => {
      it('does not return an error if the value matches an allowed type of object', () => {
        assert.equal(
          validators.oneOfType([objectSchema])(
            { foo: "string" }
          ),
          true
        );
      });
    });

    // both object schemas in the array below are equivalent  
    [
      { foo: validators.isString.isRequired },
      validators.isObject.ofShape({ foo: validators.isString.isRequired })
    ].forEach(objectSchema => {
      it('returns an error if the value matches an allowed type of object', () => {
        assert.equal(
          validators.oneOfType([objectSchema])(
            {}
          ),
          'value failed to match one of the the allowed types'
        );
      });
    });

    it('returns an error if the value does not match an allowed type', () => {
      assert.equal(
        validators.oneOfType([validators.isBoolean, validators.isString])(1),
        'value failed to match one of the the allowed types'
      );
    });

    it('does not return an error if the value is undefined', () => {
      assert.equal(
        validators.oneOfType([validators.isBoolean, validators.isString])(
          undefined
        ),
        true
      );
    });

    describe('with isRequired', () => {
      it('does not return an error if the value is not undefined', () => {
        assert.equal(
          validators
            .oneOfType([validators.isBoolean, validators.isString])
            .isRequired('string'),
          true
        );
      });

      it('returns an error if the value is undefined', () => {
        assert.equal(
          validators
            .oneOfType([validators.isBoolean, validators.isString])
            .isRequired(undefined),
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
      it('validates the follow data', () => {
        let schema = {
          varA: validators.isBoolean,
          b: {
            varB: validators.isBoolean,
            c: {
              varC: validators.isBoolean,
            },
          },
        };
        assert.deepEqual(
          validators.validateData(schema, test.data),
          test.result
        );
      });
    });

    describe('isRequired', () => {
      const schema = {
        varA: validators.isBoolean,
        b: {
          varB: validators.isBoolean,
          c: {
            varC: validators.isBoolean.isRequired,
          },
        },
      };

      it('does not require a value if parent is undefined', () => {
        const data = {
          varA: true,
          b: {
            varB: true,
            // c is missing
          },
        };
        assert.deepEqual(validators.validateData(schema, data), true);
      });

      it('requires a value if its parent is defined', () => {
        const schema = {
          b: {
            c: {
              varC: validators.isBoolean.isRequired,
            },
          },
        };

        const data = {
          b: {
            c: {}
          },
        };

        assert.deepEqual(validators.validateData(schema, data), [
          {
            error: 'value is required but missing',
            key: 'b.c.varC',
          },
        ]);
      });
    });

    describe('edge cases', () => {
      it('rejects array when object is expected and not passed', () => {
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

        assert.deepEqual(validators.validateData(schema, data), [
          {
            error: 'value is not an object',
            key: 'b.c',
          },
        ]);
      });

      it('can accept function based schema', () => {
        const schema = validators.isObject.ofShape({
          b: {
            c: {
              varC: validators.isBoolean.isRequired,
            }
          }
        }).isRequired

        const data = {
          b: {
            c: {}
          },
        };

        assert.deepEqual(validators.validateData(schema, data), [
          { key: 'b.c.varC', error: 'value is required but missing' }
        ]);
      });
    });


    describe('extraneous key values', () => {
      it('should return errors for extra values not found in the schema', () => {
        const data = {
          extraneous: 'hello',
        };
        let schema = {
          varA: validators.isBoolean,
          b: {
            varB: validators.isBoolean,
            c: {
              varC: validators.isBoolean,
            },
          },
        };
        assert.deepEqual(
          validators.validateData(schema, data),
          [{ key: 'extraneous', error: 'extraneous key found' }]
        );
      });

      it('should not return errors for extra values not found in the schema', () => {
        const schema = { myObject: { bar: validators.isBoolean } };
        const data = {
          myValue: true,
          myArray: [],
          myObject: {
            foo: false,
            bar: true
          }
        }
        const result = validators.validateData(schema, data);
        assert.deepEqual(result, [
          { key: 'myObject.foo', error: 'extraneous key found' },
          { key: 'myValue', error: 'extraneous key found' },
          { key: 'myArray', error: 'extraneous key found' }
        ]);
      });
    });
  });

  describe('a complex example', () => {
    it('returns various errors for incorrect values', () => {
      const schema = {
        zoo: {
          hours: validators.oneOfType([
            validators.isString,
            validators.isInteger,
          ]),
          animals: validators.isArray.ofType({
            age: validators.isInteger.isRequired,
            snake: validators.oneOfType([
              validators.isString,
              validators.isBoolean,
              {
                food: validators.isObject.ofShape({
                  rat: validators.isBoolean
                }).isRequired
              },
            ]).isRequired
          })
        },
      };

      const data = {
        zoo: {
          hours: 4.5,
          animals: [{ snake: { food: { rat: true } } }, { age: 4, snake: "happy" }, { age: 4, snake: 50 }],
        },
      };
      const result = validators.validateData(schema, data);

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
});
