const http = require('http');
fetch("http://localhost:3000/api/market?symbol=bitcoin&timeframe=1D").then(r => r.text()).then(console.log).catch(console.error);
