import {server} from './app';

server({
  port: process.env.PORT || 7777,
  webpackPort: process.env.WEBPACK_PORT || 7778,
  socketUrl: process.env.SOCKET_URL || "wss://plenary.unhangout.io:8082",
  stunServer: process.env.STUN_SERVER || "stun:plenary.unhangout.io:5349",
  plenaryUsername: process.env.PLENARY_USERNAME || "plenary_user",
  plenaryPassword: process.env.PLENARY_PASSWORD || "password",
  dialplanDestinationNumberPrefix: process.env.DIALPLAN_DESTINATION_NUMBER_PREFIX || "plenary-"
});
