# Workshop: Migrate to Typescript

This walkthrough illustrates how to adopt TypeScript in an existing React/Babel/Webpack project. We'll start with a TicTacToe project written fully in JavaScript. By the end, you will have a TicTacToe project fully written with TypeScript.

## Prerequisites

You need following software/tools for this workshop

- [git](https://git-scm.com/)
- [NodeJs](https://nodejs.org/en/) >= v6
- [Yarn](https://yarnpkg.com/en/docs/install) `npm install -g yarn`
- Code Editor ( we peffer [VSCode](https://code.visualstudio.com/Download) ! )

Clone this repo:

```sh
git clone git@github.com:Hotell/workshop-migrate-to-typescript.git
```

then ho to your terminal and execute following commands:

```sh
cd workshop-migrate-to-typescript
rm -rf .git
git init
code .
```

Install npm dependencies in `package.json`:

```sh
npm install
#or
yarn install
```

Now install recommended plugins for VSCode:

![install-plugins](https://code.visualstudio.com/images/extension-gallery_recommendations.png)


## Let's start !

Adopting TypeScript in any project can be broken down into 2 phases,
 * Adding TypeScript compiler (tsc) to your build pipeline.
 * Converting JavaScript files into TypeScript files.

### Understand the existing JavaScript project

Before we dive into TypeScript adoption, let's take a look at the structure of the TicTacToe app. It contains a few components and looks like below with or without TypeScript.

<p align="center">
  <img src ="image/components.png"/>
</p>

As shown in `package.json`, the app already includes:
- React/ReactDOM,
- Webpack as bundler
- npm/yarn as task runner,
- [babel-loader](https://github.com/babel/babel-loader) Webpack plugin to use Babel for ES6 and JSX transpilation.

The project has the below overall layout before we adopt TypeScript:

```
workshop-migrate-to-typescript/
  |-- src/
    |-- index.html      // web page for our app
    |-- main.jsx        // app boot and initialization logic
    |-- style.css       // app css
    |-- app/			      // app source files
      |-- constants.js	    // some shared constants
      |-- App.jsx		        // the root App React component
      |-- Board.jsx		      // the TicTacToe Board React component
      |-- Cell.jsx		      // the TicTacToe Cell React component
      |-- GameStateBar.jsx	// GameStatusBar React component
      |-- RestartBtn.jsx	  // RestartBtn React component
  |-- .babelrc		       // a list of babel presets
  |-- package.json		   // node package configuration file
  |-- webpack.config.js	 // Webpack configuration file
```

## Add TypeScript compiler to build pipeline

### Install dependencies

<p><details>
  <summary><b>TASK:  Install typescript and webpack plugins</b></summary>

Install:
- TypeScript (2.4 or higher),
- [awesome-typescript-loader](https://www.npmjs.com/package/awesome-typescript-loader)
- [source-map-loader](https://www.npmjs.com/package/source-map-loader)

as dev dependencies.

> **awesome-typescript-loader**L is a Webpack plugin that helps you compile TypeScript code to JavaScript, much like babel-loader for Babel. There are also other alternative loaders for TypeScript, such as [ts-loader](https://github.com/TypeStrong/ts-loader).

> **source-map-loader** adds source map support for debugging.

```sh
yarn add --dev typescript@2.4.0 awesome-typescript-loader source-map-loader
# or
npm install --save-dev typescript@2.4.0 awesome-typescript-loader source-map-loader
```
</p></details>

<p><details>
  <summary><b>TASK: Install 3rd party type definitions ( React, ReactDOM )</b></summary>

Get the type declaration files (.d.ts files) from [@types](https://blogs.msdn.microsoft.com/typescript/2016/06/15/the-future-of-declaration-files/) for any library in use.
For this project, we have React and ReactDOM.


```sh
yarn add --dev @types/react @types/react-dom
# OR
npm install --save-dev @types/react @types/react-dom
```
</p></details>

### Configure TypeScript

Next, configure TypeScript by creating a `tsconfig.json` file via `yarn tsc -- --init`.

<p><details>
  <summary><b>TASK: Setup Typescript within tsconfig.json</b></summary>

Now allow following options:

```
{
  "compilerOptions": {
    "outDir": "./ts-out/",      // path to output directory
    "sourceMap": true,          // allow sourcemap support
    "strictNullChecks": true,   // enable strict null checks as a best practice
    "module": "es2015",         // specifiy module code generation
    "target": "es2017",         // specify ECMAScript target version
    "jsx": "preserve",          // don't transpile jsx to js, let babel handle it
    "allowJs": true             // allow a partial TypeScript and JavaScript codebase
  },
  "include": [
    "./src/"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

You can edit some of the options or add more based on your own need. See more full [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html).
</details></p>

### Set up build pipeline

To add TypeScript compilation ( striping types ) as part of our build process, you need to modify the Webpack config file `webpack.config.js`.

This section is specific to Webpack. However, if you are using a different task runner (e.g. Gulp) for your React/Babel project, the idea is the same - add TypeScript before Babel build step and feeding it's output to Babel.

> If you wish, you can also remove Babel completely, as TypeScript is also a powerful transpiler, we will do this optional step in the end of the workshop.

<p><details>
  <summary><b>TASK: Add Typescript to build pipeline</b></summary>

Generally, we need to change `webpack.config.js` in a few ways,

1. Expand the module resolution extensions to include `.ts` and `.tsx` files.
2. add `awesome-typescript-loader` before `babel-loader` ( in Webpack loaders are defined in reverse )
3. Add source-map support ( so we can see TS source in devTools ).

Let's modify `webpack.config.js` as below,

```diff
const config = env => {
  return {
    // change to .tsx if necessary
    entry: resolve(PATHS.root, 'main.jsx'),
    output: {
      filename: 'bundle.js',
      path: PATHS.dist,
    },
    resolve: {
+      extensions: ['.ts', '.tsx', '.js', '.jsx']
-      extensions: ['.js', '.jsx']
    },
    devtool: 'source-map',
    devServer: {
      stats: 'minimal',
      overlay: true,
    },
    module: {
      rules: [
+       // addition - add source-map support
+       { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        // js
+       { test: /\.(t|j)sx?$/, include: PATHS.root, use: [{ loader: 'babel-loader' }, { loader: 'awesome-typescript-loader' }] },
-       { test: /\.jsx?$/, include: PATHS.root, use: { loader: 'babel-loader' } },
        // css
        { test: /\.css$/, include: PATHS.root, use: ['style-loader', 'css-loader'] },
      ],
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ProgressBarPlugin(),
      new HtmlWebpackPlugin({
        template: resolve(PATHS.root, 'index.html'),
      }),
    ],
  }
}
```

You now have the build pipeline correctly set up with TypeScript handling the transpilation. Try bundling the app with the following command and then open `localhost:8080` in a browser,

```sh
npm start
# OR
yarn start
```
</details></p>

## Transition from JS(X) to TS(X)

In this part, we will walk through the following steps progressively,

1. Enabling TS type checking in existing JS files
2. Adding Types via JSDoc for better checking
3. Converting one module to TypeScript
4. Adding types in one module to get richer type checking
5. Fully adopting TypeScript in the entire codebase

While you get the most out of TypeScript by fully adopting it across your codebase, understanding each of the five steps comes in handy as you decide what to do in case you have certain part of your JavaScript codebase you want to leave as-is (think legacy code that no one understands).

## Minimum transition steps

### 1. + 2. Type safety in vanilla js

If you wan't, you don't need to write any line of Typescript or change extensions of your files to `.ts/.tsx` at all.
We can allow type checking of our vanilla Javascript. Typescript is very powerful indeed!

This is provided:
- per file by leveraging `// @ts-check` pragma
- for whole project by setting `{checkJs: true}` in tsconfig.json
  - If we enable it for whole codebase, we can again explicitly turn it of per file basis via `// @ts-nocheck`.
- As a bonus TS enables us to ignore just specific lines in typed check JS via `// @ts-ignore`.

Cool stuff indeed !!!

> NOTE: [Typescript understands JSDoc annotations like a boss](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript), so if you've already used JSDoc in your project, you get immediate benefits.

<p><details>
  <summary><b>TASK: allow type checking JS files in whole project</b></summary>

Enable type checking of js files via enabling `checkJs` in tsconfig

Typescript will start complaining. Problem is with following lines across the codebase:

`import React, { Component } from 'react';`

This is because while importing a CommonJS module, Babel assumes `modules.export` as default export, while TypeScript does not.

We can fix it by changing the import statement to following across whole project:

 ```ts
 import * as React from 'react'
 import { Component } from 'react'
 ```

But as we wanna introduce minimal changes, Typescript allows us to mitigate this issue via [`{allowSyntheticDefaultImports: true}`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) in your `tsconfig.json`

So your tsconfig should look like this:

```diff
{
  "compilerOptions": {
    "outDir": "./ts-out/",      // path to output directory
    "sourceMap": true,          // allow sourcemap support
    "strictNullChecks": true,   // enable strict null checks as a best practice
    "module": "es2015",         // specifiy module code generation
    "target": "es2017",         // specify ECMAScript target version
    "jsx": "preserve",          // don't transpile jsx to js, let babel handle it
    "allowJs": true,            // allow a partial TypeScript and JavaScript codebase
+   "checkJs": true,            // enable type checking in whole JavaScript codebase
+   "allowSyntheticDefaultImports": true
  },
  "include": [
    "./src/"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

</p></details>

<p><details>
  <summary><b>TASK: fix type errors within Board and Cell</b></summary>

- wrong JSDoc annotation

- React Event mismatch

```diff
// Cell.jsx
- import React, { Component } from 'react';
+ import React, { Component, MouseEvent } from 'react';

/**
 *
- * @param {Event=} e
+ * @param {MouseEvent=} e
 */
handleClick(e) {
  this.props.handleMove();
}
```
</p></details>

<p><details>
  <summary><b>TASK: add missing JSDoc to Board.jsx to get proper type checking</b></summary>

**Hint:**

Board.jsx state consist from following types

> [Unfortunately there isn't a way how to import types from other files via `import`](https://github.com/Microsoft/TypeScript/issues/14377)

```js
/**
 * @typedef {'' | 'X' | 'O'} CellValue
 */

/**
 * @typedef {'' | 'X Wins!' | 'O Wins!' | 'Draw'} GameState
 */

 /**
 * @typedef {Object} State - creates a new type named 'State'
 * @property {Array<CellValue>} cells - an array Matrix
 * @property {GameState} gameState - a string property of BoardState
 */
```
</p></details>

### 3. Transition to TS

Let's look at `GameStateBar.jsx` as an example.

<p><details>
  <summary><b>TASK: transition GameStateBar.jsx to Typescript</b></summary>

Step one is to rename `GameStateBar.jsx` to `GameStateBar.tsx`.

If you are using any editor with TypeScript support such as [Visual Studio Code](https://code.visualstudio.com/), you should be able to see a few complaints from your editor.


Changes in GameStateBar.jsx:

```diff
- export class GameStateBar extends Component {`,
+ export class GameStateBar extends Component<any, any> {
```

The type declaration of `Component` uses [generic types](https://www.typescriptlang.org/docs/handbook/generics.html) and requires providing the types for the property and state object for the component.

The use of `any` allows us to pass in any value as the property or state object, which is not useful in terms of type checking but suffices as minimum effort to appease the compiler.

By now, *awesome-typescript-loader* should be able to successfully compile this TypeScript component to JavaScript without errors by just striping types ( remember Babel is doing transpilation to ES5 ). Again, try bundling the app with the following command and then open `localhost:8080` in a browser,

```sh
npm start
# OR
yarn start
```
</p></details>


### 4. Add types

The more type information provided to TypeScript, the more powerful its type checking is. As a best practice, we recommend providing types for all declarations. We will again use the `GameStateBar` component as an example.

For any `Component`, we should properly define the types of the property and state object. The `GameStateBar` component has no properties, therefore we can use `{}` as type.

The state object contains only one property `gameState` which shows the game status (either nothing, someone wins, or draw). Given `gameState` can only have certain known string literal values, let's use [string literal type](https://www.typescriptlang.org/docs/handbook/advanced-types.html#string-literal-types) and define the `type` alias as follow before the class declaration.

<p><details>
  <summary><b>TASK: Properly annotate GameStateBar with proper Props/State types</b></summary>

Remember, we already used this technique within JSDoc, so we have somethin like this in constants.js:
```js
@typedef {'' | 'X Wins!' | 'O Wins!' | 'Draw'} GameState
```

So create type for state:
```ts
type State = {
  gameState: '' | 'X Wins!' | 'O Wins!' | 'Draw';
}
```

With the defined type alias, change the `GameStateBar` class declaration,

```ts
export class GameStateBar extends Component<{}, State> {...}
```

Now, supply type information for its members.

> Note that providing types to all declarations is not required, but recommended for better type coverage.

```ts
// add types for params
handleGameStateChange(e: CustomEvent) {...}
handleRestart(e: Event) {...}

// add types in arrow functions
componentDidMount() {
  window.addEventListener('gameStateChange', (e: CustomEvent) => this.handleGameStateChange(e));
  window.addEventListener('restart', (e: CustomEvent) => this.handleRestart(e));
}

// add types in arrow functions
componentWillUnmount() {
  window.removeEventListener('gameStateChange', (e: CustomEvent) => this.handleGameStateChange(e));
  window.removeEventListener('restart', (e: CustomEvent) => this.handleRestart(e));
}
```

To use stricter type checking, you can also specify various [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) in `tsconfig.json`.
For example, `strict` is a recommended option for, yes you guess it, strict type checking, which consist of various rules:

- noImplicitAny
- noImplicitThis
- alwaysStrict
- strictNullChecks

You can also add [private/protected modifier](https://www.typescriptlang.org/docs/handbook/classes.html) to class members for access control.

Let's mark
- `handleGameStateChange`
- `handleRestart`

as `private` as they are internal to `GameStateBar`.

> **NOTE:** if you'll ever try to use protected or abstract in Typescript, beware your old alter OOP Java,C# is comming and may lead to destruction and oblivion

```ts
private handleGameStateChange(e: CustomEvent) {...}
private handleRestart(e: Event) {...}
```

Again, try bundling the app with the following command and then open `localhost:8080` in a browser,

```sh
npm start
# OR
yarn start
```

</p></details>

#### Common types encapsulation

You've may noticed that we introduced to GameStateBar the same part of State that is used within Board.jsx, GameStateBar.jsx, constants.js.

It's good practice to store common innert types to `types.ts` folder

<p><details>
  <summary><b>TASK: Move common types to types.ts and use them within JSDoc</b></summary>


```ts
export type GameState = '' | 'X Wins!' | 'O Wins!' | 'Draw';
export type CellValue = '' | 'X' | 'O';
```

then you can import those types everywhere ( both JS and TS files ):

```diff
// Board.js
+ import { CellValue, GameState } from './types';

-/**
- * @typedef {'' | 'X' | 'O'} CellValue
- */

-/**
- * @export
- * @typedef {'' | 'X Wins!' | 'O Wins!' | 'Draw'} GameState
- */
```

<p/></details>

### 5. Adopt TypeScript in the entire codebase

Adopting TypeScript in the entire codebase is more or less repeating the previous two steps for all js(x) files. You may need to make changes additional to what is mentioned above while converting perfectly valid JavaScript to TypeScript. However the TypeScript compiler and your editor (if it has TypeScript support) should give you useful tips and error messages. For instance, parameters can be optional in JavaScript, but in TypeScript all [optional parameter](https://www.typescriptlang.org/docs/handbook/functions.html) must be marked with `?`

> Note that you need to change webpack.config entry file:

```diff
-entry: resolve(PATHS.root, 'main.jsx'),
+entry: resolve(PATHS.root, 'main.tsx'),
```

**TASK:** Migrate rest of the codebase to Typescript


## Refactoring ( Components )

As a good practice, we don't have to uses classes for React components at all, if we don't need to use life cycle hooks or own Component state.

> **TASK:** Rewrite Components to Functions where applicable

## Enabling strict mode

> **TASK:** Enable complete strict mode and fix any TS errors

Now we wanna be 100% safe. Let's add `{"strict": true}` within our tsconfig and remove `{ strictNullChecks: true }`

---

## Bonus ( removing babel )

You may not need Babel anymore, because Typescript is also a transpiler, it's really on your preference ( TS is gonna be integraded with babylon, so you may skip this step eventulay in the future )

> **TASK:** Get rid of Babel


Just minor changes are necessary:


// webpack.config.js

```diff
const config = env => {
  return {
    entry: resolve(PATHS.root, 'main.tsx'),
    output: {
      filename: 'bundle.js',
      path: PATHS.dist,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    devtool: 'source-map',
    devServer: {
      stats: 'minimal',
      overlay: true,
    },
    module: {
      rules: [
+       // addition - add source-map support
+       { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        // js
+       { test: /\.(t|j)sx?$/, include: PATHS.root, use: [{ loader: 'awesome-typescript-loader' }] },
-       { test: /\.(t|j)sx?$/, include: PATHS.root, use: [{ loader: 'babel-loader' }, { loader: 'awesome-typescript-loader' }] },
        // css
        { test: /\.css$/, include: PATHS.root, use: ['style-loader', 'css-loader'] },
      ],
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ProgressBarPlugin(),
      new HtmlWebpackPlugin({
        template: resolve(PATHS.root, 'index.html'),
      }),
    ],
  }
}
```

We don't need anymore to check or transpile Js, so we can remove those compiler flags

// tsconfig.json
```diff
{
  "compilerOptions": {
    "outDir": "./ts-out/",     // path to output directory
    "sourceMap": true,         // allow sourcemap support
    "strict": true,            // enable strict mode as a best practice
    "module": "es2015",        // specifiy module code generation
-   "target": "es2017",        // specify ECMAScript target version
+   "target": "es5",           // specify ECMAScript target version to ES5
-   "jsx": "preserve",         // don't transpile jsx to js, let babel handle it
+   "jsx": "react",            // transpile jsx to js
-   "allowJs": true            // allow a partial TypeScript and JavaScript codebase
-   "checkJs: true             // allow type checking of Javascript files with JSDoc
  },
  "include": [
    "./src/"
  ]
}
```

You can delete `.babelrc` you no longer need it.

Last but not least, cleanup `package.json`

```diff
  "devDependencies": {
-   "babel-core": "6.25.0",
-   "babel-loader": "7.0.0",
-   "babel-preset-es2015": "6.24.1",
-   "babel-preset-react": "6.24.1",
-   "babel-preset-stage-2": "6.24.1",
    "css-loader": "0.28.4",
    "html-webpack-plugin": "2.28.0",
    "prettier": "1.4.4",
    "progress-bar-webpack-plugin": "1.9.3",
    "shx": "0.2.2",
    "style-loader": "0.18.2",
    "webpack": "3.0.0",
    "webpack-dev-server": "2.4.5"
  }
```

**WE ARE DONE!**
