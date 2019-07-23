const Router = require("koa-router");
const router = Router({
  prefix: "/dbcall"
});

router.get("/fetch_stock", async ctx => {
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

router.get("/update_order_database", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  let items = await JSON.parse(ctx.query.items);
  let orderId = ctx.query.id;
  let itemPayload = { id: orderId };
  itemPayload["date_created"] = new Date();
  for (let i = 0; i < items.length; i++) {
    itemPayload[items[i].title] = items[i].quantity;
  }
  db = ctx.db;
  db.child("orders").set({ orderId: { itemPayload } });
});

router.post("/warehouse_order", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  const oneDay = 60 * 60 * 24;
  db = ctx.db;

  let jsonData = {};
  let myRef = db.collection("orders");
  let getProd = await myRef.get().then(snapshot => {
    if (snapshot.empty) {
      console.log("no matching documents.");
      return;
    }
    snapshot.forEach(doc => {
      if (new date(doc.data().date_created) - new Date() > oneDay) {
        jsonData.push(doc.data);
      }
    });
  });
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
              email: "someEmail@gmail.com"
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
          value: jsonData
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
