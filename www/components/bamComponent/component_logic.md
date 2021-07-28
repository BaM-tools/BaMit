This files explains the logic of bam components.
It is intended for the developers of *BaMit*.
Since *BaMit* was developped using no framework (e.g. React, Vue, Svelte, etc.), the application reactivity and state is managed manually.
It relies on callbacks and several class methods:
* Callbacks are functions defined in parent components, typically the bamProject component, that communicate change of one child component to other children components and are executed by the child component. The main callback used throughout the application is *onChangeCallback* triggered any time a component state changes.
* The main methods (or functions) that manage the state of the components are the `set` and `get` functions that are used set or get the state of the components.

# structure of *BaMit*

Before giving further details on the state and reactivity management of *BaMit* which are given in the following sections, let's detail the structure of *BaMit*.

``` still to write ```

main: handle app loading making sure the server is ready and necessary ressources are available (downloaded), build the header menue (logo, new bam project, load bam project, help, language picker) and handle actions related to the header menue buttons.

bamHelp

bamProject




# set and get logic

All components (and sometimes sub classes used by a component) have a number of functions that can be used to set and get their current state.
This is used to save a bam project, and reload a project as well as change the state of a component based on event happending elsewhere in the app.
The `set` function accepts a `config` object as input and the `get` function returns a `config` object with the exact same structure.
This `config` object structure depends on the type of component.

This section explains the general logic of the set and get logic.
To illustrate and maybe better exaplain the logic, let's give an example with the bamPriors component.

The  `config` parameter of the `set` method of a bamPriors component is an array of objects: each element of the array is an object defining a parameter state.
A parameter which is managed by the bamParameter component, is defined by (1) a name, (2) an initial value, (3) a distribution name and (4) an array containins the values of the distribution parameters.
When the `set` function is called, there are several steps: 
1. For each element of the array:
    1. if the bamPriors component doesn't already have a parameter by that name, it creates the bamParameter and add it to the parameters object of the bamPriors component
    2. it updates the bamParameter component calling its `set` function with the current array element as parameter
2. For each parameter (bamParameter) contained in the bamPriors component, verify that the `config` array does contain a parameter by that name, otherwise, delete the corresponding parameter.

Here is the actual code of the function:
```js
set(config) {
    let self = this;
    for (let p in config) {
        if (!this.parameters[p]) {
            this.parameters[p] = new bamParameter(); 
            this.parameters[p].setParent(this.dom_bam_priors);
            this.parameters[p].onChangeCallback = function() {
                self.onChange();
            }
        }
        this.parameters[p].set(config[p]);
    }
    for (let p in this.parameters) {
        if (!config[p]) {
            this.parameters[p].delete();
            delete this.parameters[p];
        }
    }
    this.onChange();
}
```
The call to the `onChange` method is explained in the next section.

The `get` function of the bamPriors component simply loops over all the parameters it contains, call the `get` method on the corresponding bamParameter components and store the result in an array that is eventually returned. The actual code is:
```js
get() {
    const config = {};
    for (let p in this.parameters) {
        config[p] = this.parameters[p].get();
    }
    return config;
}
```

# onChange logic

Most component classes have an ``onChange`` method used to:
1. makes some component level changes associated with some component state change; it is usually used to make sure the component is up-to-date if any aspect of its state depends on other aspect of its state.
2. manage error messages
3. verify that the component is not outdated
4. call a callback named `onChangeCallback` that is set from a parent component to communicate changes to other components

Let's illustrate this with the bamPriors component.

``` still to write ```

# get BaM configuration state: getBaMconfig

Most component classes have a `getBaMconfig` function used to retrieve the current state of the component.
It difers from the `get` function as the it returns only the data needed to configure *BaM* on the server side.

# Miscellaneous

## internationalization

## help

## custom select input

## utility functions

functions that are used in various locations in the app, more or less usefull.

## accessability

## external dependencies

d3, jszip, marked, math, papaparse