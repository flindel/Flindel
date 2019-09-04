const Router = require("koa-router");
const router = Router({
  prefix: "/dbcall"
});
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { getTime } = require("../serverFunctions");
const Helper = require("../util/webhookHelper");

router.get("/fetch_stock", async ctx => {
  //not neccessary for launch but maybe in future
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  let sku = ctx.query.sku;
  db = ctx.db;
  if (sku == null) {
    let jsonData = {};
    let myRef = db.collection("products");
    let getProd = await myRef
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log("no matching documents.");
          return;
        }

        snapshot.forEach(doc => {
          if (doc.data().variants != null) {
            for (i = 0; i < doc.data().variants.length; i++) {
              jsonData[doc.data().variants[i].git_var_sku] = 0; //instead of doc.id it should be inventory levels
              //console.log(doc.id, "=>", doc.data().variants[i].git_var_sku);
            }
          }
        });
      })
      .catch(err => {
        console.log("Error getting documents", err);
      });
    // console.log(jsonData);
    ctx.body = jsonData; //all skus
  } else {
    let jsonData = {};
    let myRef = db.collection("products");
    let getProd = await myRef.get().then(snapshot => {
      if (snapshot.empty) {
        console.log("no matching documents.");
        return;
      }
      snapshot.forEach(doc => {
        if (doc.data().variants != null) {
          for (i = 0; i < doc.data().variants.length; i++) {
            if (doc.data().variants[i].git_var_sku == sku) {
              jsonData[doc.data().variants[i].git_var_sku] = 0;
              ctx.body = jsonData;
            }
          }
        }
      });
    });
    //only for paticular sku
  }
});
//update database to store new orders
router.post("/update_order_database", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  let items = await JSON.parse(ctx.query.items);
  let itemList = [];
  const destination = await JSON.parse(ctx.query.destination);
  const fulfId = ctx.query.fulf_id;
  const orderId = ctx.query.order_id;
  let payload = {
    orderid: orderId,
    store: ctx.query.source,
    fulfillmentid: fulfId,
    shippingAddress:
      destination.address1 + " " + destination.city + " " + destination.zip
  };
  payload["dateCreated"] = getTime();
  payload["workerid"] = "";
  payload["code"] = "";
  payload["status"] = "incomplete";
  payload["name"] = destination.name;
  payload["comment"] = "";

  for (let i = 0; i < items.length; i++) {
    Helper.sellReturnItem(
      ctx.db,
      items[i].variant_id.toString(),
      ctx.query.source,
      orderId
    );
    itemList[i] = {
      itemid: items[i].id.toString(),
      variantid: items[i].variant_id.toString(),
      quantity: items[i].quantity,
      name: items[i].title,
      fulfilled: 0,
      productid: items[i].product_id.toString()
    };
  }
  payload["items"] = itemList;
  db = ctx.db;
  let myRef = db
    .collection("fulfillments")
    .doc()
    .set(payload);
  ctx.body = "success";
});
//send warehouse the email of orders needed to fulfil
router.post("/warehouse_order", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  //get db info
  db = ctx.db;

  let jsonData = [];
  let myRef = db.collection("fulfillments");
  let getProd = await myRef.get().then(snapshot => {
    if (snapshot.empty) {
      console.log("no matching documents.");
      return;
    }
    snapshot.forEach(doc => {
      jsonData.push(doc.data);
    });
  });
  //send email
  const headers = {};
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = "Bearer " + process.env.SEND_GRID;

  const option = {
    method: "POST",
    url: "https://api.sendgrid.com/v3/mail/send",
    headers: headers,
    json: true,
    body: {
      personalizations: [
        {
          to: [
            {
              email: "cengizsirlan.cs@gmail.com"
            }
          ],
          subject: "warehouse"
        }
      ],
      from: {
        name: "Auto-Confirmation",
        email: "no-reply@sender.com"
      },
      content: [
        {
          type: "text/plain",
          value: JSON.stringify(jsonData)
        }
      ]
    }
  };
  try {
    ctx.body = await rp(option);
  } catch (err) {
    console.log(err.message);
    if (err instanceof errors.StatusCodeError) {
      ctx.status = err.statusCode;
      ctx.message = err.message;
    } else if (err instanceof errors.RequestError) {
      ctx.status = 500;
      ctx.message = err.message;
    }
  }
});
//not neccesary for launch and may never be
router.get("/track_num", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");

  let gitID = ctx.query.gitID;
  db = ctx.db;
  let myRef = db.collection("products").doc(gitID);
  getDoc = await myRef.get();
  ctx.body = getDoc;
});

module.exports = router;
