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
              jsonData[doc.data().variants[i].git_var_sku] = doc.id; //instead of doc.id it should be inventory levels
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
