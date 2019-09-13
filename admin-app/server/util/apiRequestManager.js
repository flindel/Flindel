const Bottleneck = require("bottleneck/es5");
const rp = require("request-promise");
let requestArr = [];
function apiRequestManager(option, minTime) {

    this.option = option;
    this.minTime = minTime;
}
apiRequestManager.prototype.send = async function send(){
    const limiter = new Bottleneck({
        minTime: this.minTime,
        maxConcurrent: 1,
      });
    const rep = await limiter.schedule(()=>rp(this.option));
    return rep;
}

module.exports = apiRequestManager;