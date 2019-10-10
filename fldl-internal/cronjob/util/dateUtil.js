"use strict";
//returns current date (MM/DD/YYYY)
function getCurrentDate() {
    let currentDate = "";
    currentDate +=
      new Date().getMonth() +
      1 +
      "/" +
      new Date().getDate() +
      "/" +
      new Date().getFullYear();
    return currentDate;
}
  
//calculates and returns difference between two dates (time elapsed)
function getDateDifference(d1, d2) {
    const date2 = new Date(d2);
    const date1 = new Date(d1);
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

module.exports = {
    getCurrentDate,
    getDateDifference
};