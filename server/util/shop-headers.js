function getShopHeaders (ctx) {
    const { cookies } = ctx;
    const shop = cookies.get('shop_id') || ctx.query.shop ;
    const accessToken = cookies.get('accessToken') || ctx.header['accessToken'] ;
    return {
        shop: shop,
        accessToken: accessToken
    };
}

module.exports = { getShopHeaders };