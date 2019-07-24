const rp = require('request-promise');

async function getStoreEmail(dbIn, store){
    db = dbIn
    myRef = db.collection('shop_tokens').doc(store)
    let query = await myRef.get()
    const email = query._fieldsProto.email.stringValue
    return email
}

async function sendItemEmail(itemList, email){
    const headers = {}
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';
    headers['Authorization'] = 'Bearer ' + process.env.SENDGRID;
    message = ""
    if (itemList.length>0){
        message += 'The following return items have been accepted in the last 12 hours, and are eligible for potential resale in the morning.'
        message +='\n\n'
        for (var i = 0;i<itemList.length;i++){
            message += (i+1) + ': '+ itemList[i].name + ' - ' + itemList[i].variantid + ' ... Quantity: ' + itemList[i].quantity
            message += '\n\n'
        }
    }
    const option = {
      method: 'POST',
      url: 'https://api.sendgrid.com/v3/mail/send',
      headers: headers,
      json: true,
      body: {
        "personalizations": [
          {
            "to": [
              {
                "email": 'booleafs17@yahoo.ca' //change to EMAIL once live
              }
            ],
            "subject": "Daily Report - Items Received"
          }
        ],
        "from": {
            "name": "Daily Report",
          "email": "no-reply@sender.com"
        },
        "content": [
          {
            "type": "text/plain",
            "value": message
          }
        ]
      }
  }
    await rp(option);  
}

async function sendRefundEmail(orderList, email){
    const headers = {}
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';
    headers['Authorization'] = 'Bearer ' + process.env.SENDGRID;
    let message = ''
    if (orderList.length>0){
    message += 'The following orders have items that should be refunded.'
    message +='\n\n'
    for (var i = 0;i<orderList.length;i++){
    message += 'Order Number ' + orderList[i].orderNum + ': '
      for(var j = 0;j<orderList[i].refundItems.length;j++){
          message += '\n'
          message += '\t'
          message += orderList[i].refundItems[j].variantid + ' ... ' + orderList[i].refundItems[j].name 
      }
      message += '\n\n'
    }
  }

    const option = {
      method: 'POST',
      url: 'https://api.sendgrid.com/v3/mail/send',
      headers: headers,
      json: true,
      body: {
        "personalizations": [
          {
            "to": [
              {
                "email": emailAdd //change to EMAIL once live
              }
            ],
            "subject": "Daily Report - Refunds Necessary"
          }
        ],
        "from": {
            "name": "Daily Report",
          "email": "no-reply@sender.com"
        },
        "content": [
          {
            "type": "text/plain",
            "value": message
          }
        ]
      }
  }
    await rp(option);
}

module.exports = {getStoreEmail, sendItemEmail, sendRefundEmail}