"use strict";
const { Error } = require("../error");
// When return empty object means either shop and token are incorrect and should return 401 bad request
function getShopHeaders(ctx) {
  const { cookies } = ctx;
  const shop =
    cookies.get("shop_id") ||
    ctx.query.shop ||
    (ctx.session ? ctx.session.shop : undefined);
  if (!shop) {
    ctx.throw(401, Error.invalidShop);
    return;
  }
  const accessToken =
    cookies.get("accessToken") ||
    ctx.accessToken ||
    ctx.header["accessToken"] ||
    (ctx.session ? ctx.session.accessToken : undefined);
  if (!accessToken) {
    ctx.throw(401, Error.invalidAccessToken);
  }

  return {
    shop: shop,
    accessToken: accessToken
  };
}

module.exports = { getShopHeaders };
