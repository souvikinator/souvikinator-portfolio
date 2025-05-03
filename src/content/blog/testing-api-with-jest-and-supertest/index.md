---
title: 'Testing Node.js APIs with Jest and Supertest'
date: 2022-07-02T01:00:00+05:30
draft: false
tags: ['nodejs', 'testing', 'jest', 'supertest', 'api']
description: 'Learn how to effectively test your Node.js APIs using Jest and Supertest for robust and reliable applications.'
image: './cover.png'
---

Here's how to set up unit tests for API endpoints.

We'll be using the following NPM packages:

- Express for the server (any other framework can be used)
- Jest
- Supertest

VS Code extension using:

- Jest
- Jest Runner

## Installing dependencies

```bash
npm install express
```

```bash
npm install -D jest supertest
```

Here is what the directory structure looks like:

![](https://imgur.com/y9bWMUr.png)

and lets not forget `package.json`

```javascript
{
  "name": "api-unit-testing",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "jest api.test.js",
    "start":"node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.1"
  },
  "devDependencies": {
    "jest": "^28.1.2",
    "supertest": "^6.2.3"
  }
}
```

## Creating a simple express server

An express server that accepts `POST` requests with a `body` and `title` on the `/post` endpoint. If either one is missing, status `400 Bad Request` is returned.

```javascript
// app.js
const express = require('express')
const app = express()

app.use(express.json())

app.post('/post', (req, res) => {
  const { title, body } = req.body

  if (!title || !body)
    return res.sendStatus(400).json({ error: 'title and body is required' })

  return res.sendStatus(200)
})

module.exports = app
```

```javascript
const app = require('./app')
const port = 3000

app.listen(port, () => {
  console.log(`http://localhost:${port} 🚀`)
})
```

The express app is exported for use with `supertest`. The same can be done with other HTTP server frameworks.

## Creating test file

```javascript
// api.test.js
const supertest = require('supertest')
const app = require('./app') // express app

describe('Creating post', () => {
  // test cases goes here
})
```

`Supertest` takes care of running the server and making requests for us, while we focus on testing.

The express app is passed to the `supertest` agent and it binds express to a random available port. Then we can make an HTTP request to the desired API endpoint and compare its response status with our expectation:

```javascript
const response = await supertest.agent(app).post('/post').send({
  title: 'Awesome post',
  body: 'Awesome post body',
})
```

We'll create test for 3 cases:

- When both `title` and `body` are provided

```javascript
test('creating new post when both title and body are provided', async () => {
  const response = await supertest.agent(app).post('/post').send({
    title: 'Awesome post',
    body: 'Awesome post body',
  })

  // comparing response status code with expected status code
  expect(response.statusCode).toBe(200)
})
```

- When either of them is missing

```javascript
test('creating new post when either of the data is not provided', async () => {
  const response = await supertest.agent(app).post('/post').send({
    title: 'Awesome post',
  })

  expect(response.statusCode).toBe(400)
})
```

- When both of them is missing

```javascript
test('creating new post when no data is not provided', async () => {
  const response = await supertest.agent(app).post('/post').send()

  expect(response.statusCode).toBe(400)
})
```

and the final code should look like:

```javascript
const supertest = require('supertest')
const app = require('./app') // express app

describe('Creating post', () => {
  test('creating new post when both title and body are provided', async () => {
    const response = await supertest.agent(app).post('/post').send({
      title: 'Awesome post',
      body: 'Awesome post body',
    })
    expect(response.statusCode).toBe(200)
  })

  test('creating new post when either of the data is not provided', async () => {
    const response = await supertest.agent(app).post('/post').send({
      title: 'Awesome post',
    })
    expect(response.statusCode).toBe(400)
  })

  test('creating new post when no data is not provided', async () => {
    const response = await supertest.agent(app).post('/post').send()
    expect(response.statusCode).toBe(400)
  })
})
```

## Running Test

Run test using following command:

```bash
npm run test
```

![](https://imgur.com/YpR8qr6.png)

If using VS Code extensions like `jest` and `jest runner` then it'll do the work for you.

![](https://imgur.com/e1nD1zk.png)

And this is how we can easily test API endpoints. 💪

![](https://media.giphy.com/media/SKGo6OYe24EBG/giphy.gif)
