This files details the structure of the config objects of the bamComponents i.e. the stucture of the object received by the `set` function and returned by the `get` function.

# bamXtra

```js
{
    inputs: {
        `<input variable name>`: {name: `<character string. input variable name>`},
        ...
    },
    ouputs: {
        `<output variable name>`: {name: `<character string. output variable name>`},
        ...
    },
    parameters: {
        `<parameter name>`: {name: `<character string. parameter name>`},
        ...
    }, 
    ...
}
```
The dots `...` at the end of the object  indicate that additional items might exist in the object that are specific to the type of model (e.g. TextFile, BaRatin) as detailed below.

## bamXtraTextFile

```js
{
    ...,
    textfile: {
        equations: [
            {
                default_name: `<character string. default output name of the equation, e.g. 'Y1'>`,
                defined_name: `<character string. user defined name of the equation output, e.g. 'y'>`,
                equation: `<character string: equation syntax e.g. 'a*x+b'>`
            },
            ...
        ],
        variables: {
            `<variable_name>`: `<character string indicating the variable_type => 'p' for parameter; 'i' for input variable>` 
        }
    }
}
```
# bamDatasets
```js
{
    `<file name>`: {
        name: `<character string. File name.>`,
        data: {
            `Column name`: [`<Float. Value for row 1>`, ..., `<Float. Value for row n>`],
            ...
        }
    },
    ...
}
```
# bamPredictionMaster

```js
{
    inputs: bamXtra.inputs,
    outputs: bamXtra.outputs,
    predictions: [
        bamPrediction, ...
    ]
}
```

# bamPrediction

```js
{
    name: `<character string. prediction name.`
    datasets: bamDatasets,
    inputs: {
        `<variable name>`: bamvariable,
        ...
    }
    outputs: bamXtra.outputs,
}
```