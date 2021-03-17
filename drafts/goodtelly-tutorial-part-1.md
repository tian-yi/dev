---
title: Build a movie app using modern React and Material UI - Part 1
date: '2020-10-28'
---

# What are we going to build?

You've probably seen plenty articles out there to teach you how to build a
React app, especially a movie app. So here's my take on it.
You can find the finished app at [https://goodtelly.com](https://goodtelly.com).

This is actually one of my hobby projects, and you'd call it a "production"
app. This app has some extra features than just a simple movie app.

Though We will not cover everything from the goodtelly site in this tutorial series.
There will be more series of tutorials in the future to cover more advanced
features.

The features will be covered in this series are:
* See most popular Movies and TV Shows
* Search Movies and TV Shows
* Display a movie or a TV show's detail page.
* The detail page will include the information about the movie and its cast and
  some important crew members.

# Some Libraries and tools we will use for this project
* [Create React App](https://create-react-app.dev/).
* [Material-UI](https://material-ui.com/).
* [React Router V5](https://reactrouter.com/)

# Setting up the project
We will use [Create React App](https://create-react-app.dev/) in this
tutorial.
So open your terminal and type
```bash
npx create-react-app goodtelly-react
```

This will create a project called `goodtelly-react` and install some essential
packages needed for a simple react app.
