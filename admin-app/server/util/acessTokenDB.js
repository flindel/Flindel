async function accessTokenDB(ctx){
    db = ctx.db
    console.log("util func"+ctx)
    const shop = ctx.query.shop 
    myRefToken = db.collection('shop_tokens').doc(shop);
    getToken = await myRefToken.get()
    let token = getToken._fieldsProto.token.stringValue
    return token
}

module.exports = {accessTokenDB}