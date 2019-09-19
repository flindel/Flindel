const startCron = require('./cronjob/run-all');
const Koa = require("koa");

const port = parseInt(process.env.PORT, 10) || 3000;

startCron();

// Google Run require container to have a server 
const app = new Koa();
app.listen(port, () => {
    console.log(`> Ready on localhost:${port}`);
});