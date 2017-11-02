# react-chat

React-Chat is a multi parti chat application developed using React framework. It is built on top of socket.io to handle communication over websocket.

## Prerequisites
- Node.js
- MongoDB
- Yarn or npm
 
## Configuration
Host name need to be configured in `'app/constants.js'` in `HOST` attribute.
If www.example.com is the host then,
```
export default {
	HOST: 'http://example.com:3000',
	;
}
```
Port 3000 is for running in development mode. Do not use port while running in production mode as production will run on port 80 by default. This can be reconfigured in package.json if a reverse proxy such as Nginx need to be used.

A MongoDB database need to be created and connection string has to be configured in `'config/configuration.js'` in `DB_HOST` attribute.
If `'react-chat'` is the database name, `'myuser'` is the username and `'abcd1234'` is the password then,
```
export default {
	;
	DB_HOST : 'mongodb://myuser:abcd1234@localhost:27017/react-chat'
}
```

A session scret need to be configured in `'config/configuration.js'` in `SERVER.SESSION_SECRET` attribute.

If `'my-session-secret'` is the secret then,
```
export default {
    SERVER: {
		SESSION_SECRET: "my-session-secret"
	},
	;
}
```

## Running
Webpack module bundler is used to build. While developing, both React and Node.js need to be run in parallel. React will build and run client side scripts with Webpack and nodemon will do the same for server side scripts. Below given targets can be used for these purposes.

- **build:** This target can be used to build and bundle client side scripts to `'chat.min.js'` for production.
```
yarn build
```
- **start:** This target can be used to run Node.js server in production. This will run indefinettely and will listen to default port 80. Fully functional fullstack app can be accessed through http://localhost or through the configured host.
```
yarn start
```
- **client:** This target can be used to build and bundle client side scripts to `'chat.min.js'` for development. This will run indefinettely and will listen to port 8080. React app can be accessed through http://localhost:8080/public or through the configured host. This target will also monitor for any change that happens to client side scripts. If a change detected, it will rebuild `'chat.min.js'` and its map file for debugging.
```
yarn client
```
- **server:** This target can be used to build and run Node.js server. This will run indefinettely and will listen to port 3000. Fully functional fullstack app can be accessed through http://localhost:3000  or through the configured host.
```
yarn server
```

While developing both `client` and `server` targets need to be run in parallel.

## Usage

During first launch of the app, it will auto redirect to the login page as no user has logged in. From there a new user can be created through Sign-Up page. After Signing-In, a room need to be created using the left side panel. After creating the room, participants need to be added to the room using the right side panel with the participant's email ids. A single email id or a comma separated list of email ids can be given. A participant's email id who hasn't joined in the network yet can also be given. After that, chatting can be started using the middle panel. Participants can be added at any time by anyone in the chat room. A participant cannot remove another participant, but can quit the room with the 'Exit this room' button.
