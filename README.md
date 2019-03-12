# About

Pipes recent messages from the Turkers Reddit chat to standard output, line-by-line, in descending chronological order.

# Setting Up

1. Make sure [Node](https://nodejs.org/en/download/) is installed.

2. Run `npm i` in the project's base directory to fetch and set up dependencies.

3. Go to the Reddit chat, open the Chrome developer console, switch to the Network tab, and scroll back in the chat log to force a reload.

4. A new network request will appear which has `Session-Key` as one of the request headers. Copy this value, you'll use it shortly.

3. Create a `secrets.js` file in the base directory which follows this template:

```js
module.exports = {
    sessionKey: "THE VALUE OF YOUR SESSION KEY FROM STEPS 3-4 HERE"
};
```

4. From the project's base directory, run tool with either `node .` or `node index`.

# Optional Parameters

### `-n NUM_OF_POSTS`

By default, the tool fetches the `200` most recent posts. However, this can be overridden with then `-n` option, replacing `NUM_OF_POSTS` with the desired number of posts to fetch.

Defaults to `200` messages if this argument is not specified.

### `-m SOME_MESSAGE`

Instead of getting the most recent messages, send a message.

**NOTE**: This requires that the object exported from `secrets.js` has accurate `userId` and `accessToken` properties.

*Special thanks to [saqfish](https://www.github.com/saqfish) for going through the trouble of figuring out how to interface with the SendBird API and digging out the relevant key and group ID info.*