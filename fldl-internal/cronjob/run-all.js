const checkExpired = require('./functions/checkExpired');
const handlePending = require('./functions/handlePending');
const fulfillmentReport = require('./functions/fulfillmentReport');
const cron = require("cron");
const { CronJob } = cron;

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://flindel-dev.firebaseio.com"
});
const db = admin.firestore();

function dailyJob() {
    //new CronJob("*/30 * * * * *", warehouseOrder, null, true);
    //second (0-59) - minute (0-59) - hour(0-23) - day of month (1-31) - Month (1-12) - Day of Week (0-6, Sun-Sat)
    const job = new CronJob(
        "*/10 * * * * *",
        async function() {
            //KEEP THIS ORDER OF STUFF. unblock all when we go live, set time '0 0 0 * * *'
            console.log('runCron');
            try{
                await checkExpired(db);
                await handlePending(db);
                await fulfillmentReport(db);
            } catch (err) {
                console.error(err);
            }

        }
    );
    return job;
}

function start() {
    dailyJob().start();
}

module.exports = start;
