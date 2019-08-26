// When return empty object means either shop and token are incorrect and should return 401 bad request 
async function getShopHeaders (ctx) {
    const { cookies } = ctx;
    const shop = cookies.get('shop_id') || ctx.query.shop;
    if (!shop) {
        return {};
    }
    const accessToken = cookies.get('accessToken') || ctx.header['accessToken'] ;
    if (!accessToken) {
        let tokenRef = ctx.db.collection("shop_tokens").doc(shop);
        try {
            let tokenDoc = await tokenRef.get();
            if (tokenDoc.exists) {
                return {
                    shop: shop,
                    accessToken: tokenDoc.get('token')
                };
            }
        } catch(err) {
            console.log(err);
        }
        return {};
    }
}

module.exports = { getShopHeaders };