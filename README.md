# HTML Seed
Seed repository for starter HTML/Template/Web project.

## Installation and Usage
### Step 1: install Node and npm
Before using this project, you must install NodeJS (>= 4.4.5) and npm. You can download the package from [NodeJS website](https://nodejs.org/en/).
### Step 2: install dependencies
You must install two npm modules globally, `gulp` and `bower`:
```
  sudo npm install -g gulp bower
```
Remeber to use `sudo` only if you are on UNIX system!
### Step 2.1 install TypeScript
If you want, you can use TypeScript instead of normal JavaScript. You just install TypeScript globally with:
```
  sudo npm install -g typescript
```
### Step 3: install local dependencies
Download this repository as package or cloning via git.
After that, move to the folder via terminal:
```
  cd path/to/folder
```
and install all the local dependencies:
```
  npm install
```
Note the sudo is not required for local packages. However, if you have permession errors, you can use `sudo` or try to resolve the permission errors.
### Step 4: gulp commands
There are two basic commands:
```
  gulp watch
```
This watch file modification and rebuilt it. Actually, gulp watch on styles and scripts.
```
  gulp
```
This build all the file and optimize all images.
### Optional: bower libraries
This seed project use bower for managing external (vendor) libraries.

All the libraries are saved on _assets/libraries_ folder. If you want to change the libraries folder, you must edit the _.bowerrc_ file in the root folder, and change:
```
  {
    "directory": "assets/libraries"
  }
```
### Optional: Pattern Lab integration
This project can also be integrated with [Pattern Lab](https://github.com/pattern-lab/edition-node-gulp). The mail goal is principally the sharing of the assets between the real project and the Pattern Lab.
#### Step 1 - Pattern Lab: download and install
First you need to download [Pattern Lab node + Gulp](https://github.com/pattern-lab/edition-node-gulp) and rename the folder to _patterns_. This folder must be at the same level of the project folder:
```
  html -
      |- assets
      |- *.html
      |- gulpfile.js
      |- ...
  patterns -
      |- public
      |- source
      |- gulpfile.js
      |- ...
```
#### Step 2 - Pattern Lab: run server
Now you can run the server of Pattern Lab via:
```
  gulp patternlab:serve
```
**Important**: new version of Pattern Lab require gulp 4.x+, actually not released yet. If you want to not install this version globally, run gulp locally:
```
  node_modules/gulp/bin/gulp.js patternlab:serve
```
Now you can work with the Pattern Lab, defining your atoms, molecules, etc.
#### Step 3 - Pattern Lab: share assets
Open another terminal window and `cd` to project folder. Now, you can run
```
  gulp watch -s
```
and all the assets is copied from _html_ to _patterns_ folder when you work in watch mode.

Probably, you can adjust and modify assets inclusion in the _\_source/\_meta/\_00-head.mustacke_.

If you are ready, you can run
```
  gulp -s
```
to generate and copy all the assets to _patterns_ folder.
#### Step 4 - Pattern Lab: generate distribution
When your are ready, you can distribute the pattern libraries via
```
  gulp
```
or
```
  node_modules/gulp/bin/gulp.js
```