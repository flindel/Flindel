import React from "react"
import {serveo_name} from '../config'

class Revert extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      shop: "",
      isReverting: false,
      revertProgress: 0,
      revertTotal: 0,
    }

    this.finishedReverting = this.finishedReverting.bind(this);
  }

  async revert(){
    this.setState({isReverting: true})
    //get fulfillment service ID
    const fulservId = await this.getFulfillmentService();
    console.log("fulservId: ", fulservId)
    this.deleteFulserv(fulservId);
    this.revertScriptTag();
    this.getGitCollectionId();
    //in callback it deletes all git products and deletes git collection
  }

  async getFulfillmentService(shop = this.state.shop){
    var temp;
    temp = await fetch(`${serveo_name}/revert/fulserv/firestore/id?shop=${encodeURIComponent(shop)}`, {
      method: 'get',
    }).catch((error) => {return undefined;})
    var json  = await temp.json();
    if(json._fieldsProto){
      if(json._fieldsProto.fulfillment_service){
        return json._fieldsProto.fulfillment_service.integerValue;
      }
    }
   }

   del(product_id, callback = doNothing){
     fetch(`${serveo_name}/products?id=${encodeURIComponent(product_id)}`, {
       method: 'delete',
       })
       .then((response) => {
         if(response.ok){return response.json()}
         else{throw Error(response.statusText)}
       })
       .then((data) => {
         console.log('DELETE: ', data)
         this.delProduct(""+product_id); //removes from FIRESTORE
         callback(data);
       })
       .catch((error) => console.log(error));
   }

    async delProduct(gitID){
     var temp;
     temp = await fetch(`${serveo_name}/firestore/product/git/?gitID=${encodeURIComponent(gitID)}`, {
       method: 'delete',
     })
   }

  async getGitCollectionId() {
    fetch(`${serveo_name}/revert/collections/all/?shop=${encodeURIComponent(this.state.shop)}`, {
      method: 'get',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('GET Collection: ', data);
        const smart_collections = data.smart_collections;
        console.log("Smart Collections", smart_collections);
        for (let i = 0; i < smart_collections.length; i++){
          if(smart_collections[i].title == "Get it Today"){
            console.log("Git Collection ID", smart_collections[i].id);
            this.deleteAllGitProducts(smart_collections[i].id);
            this.deleteGitCollect(smart_collections[i].id);
          }
        }
      })
      .catch((error) => console.log(error))

  }

  deleteGitCollect(gitCollectionId){
    fetch(`${serveo_name}/revert/collections?id=${encodeURIComponent(gitCollectionId)}&shop=${encodeURIComponent(this.state.shop)}`, {
      method: 'delete',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('DELETE Smart Collection: ', data)
      })
      .catch((error) => console.log(error));
  }

  deleteFulserv(fulservId){
    fetch(`${serveo_name}/revert/fulserv?id=${encodeURIComponent(fulservId)}&shop=${encodeURIComponent(this.state.shop)}`, {
      method: 'delete',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('DELETE Fulfillment Service: ', data)
      })
      .catch((error) => console.log(error));
  }

  deleteAllGitProducts(gitCollectionId){
    //Delete all Get it Today
    fetch(`${serveo_name}/revert/collections?id=${encodeURIComponent(gitCollectionId)}&shop=${encodeURIComponent(this.state.shop)}`, {
      method: 'GET',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then(resData=> {
        let gitProductIds = resData.products.map((product) => {return product.id;})
        this.setState({revertTotal: gitProductIds.length})
        console.log("DELETE GIT Products: ", gitProductIds)
        gitProductIds.map(id => {this.del(id, this.finishedReverting)})
      })
      .catch((error) => console.log(error))
  }

  //1.get all ids from db 2.delete scriptTag from Shopify by id 3. Update status as "revert" in DB
  async revertScriptTag(){
    //get all ids and save in idsArray
    let scripttagIDTemp = await fetch(`${serveo_name}/revert/scriptTag/db/ids?shop=${encodeURIComponent(this.state.shop)}`, {
      method: 'get',
    })
    let scripttagIDJson = await scripttagIDTemp.json()
    const idsArray = scripttagIDJson.ids
    //for each id, delete from shopify
    for(let i=0;i<idsArray.length; i++){
      console.log(idsArray[i])
      let deleteTemp = await fetch(`${serveo_name}/revert/scriptTag/shopify?id=${encodeURIComponent(idsArray[i])}&shop=${encodeURIComponent(this.state.shop)}`,{
        method:'delete'
      })
      let deleteJson = await deleteTemp.json()
      console.log(`${idsArray[i]} is deleted ${deleteJson}`)
    }
    //update status as "revert" in database
    let statusTemp = await fetch(`${serveo_name}/revert/scriptTag/db/status?shop=${encodeURIComponent(this.state.shop)}`, {
      method: 'get',
    })
    let revertResp = await statusTemp.json()
    if(revertResp.success){
      console.log("ScriptTags deleted")
    }
  }

  async handleClick(){
    let textValue = document.getElementById("storeName").value;
    console.log(document.getElementById("storeName").value);
    var confirmed = confirm("This will remove all Flidel Services from "+textValue+". \nAre you sure you want to proceed?")
    if (confirmed){
      textValue = textValue+".myshopify.com"
      this.setState({shop: textValue})
      const fulservId = await this.getFulfillmentService(textValue);
      if (fulservId){
        console.log("fulservId +", fulservId);
        this.revert();
      }
      else{
        alert("Invalid Store Name, Please do not include \".myshopify.com\" in the text box.")
        console.log("fulservId -", fulservId);
      }

      //this.revert();
    }
  }

  finishedReverting(data){
    console.log("revertProgress", this.state.revertProgress);
    this.setState((state) => ({
      revertProgress: state.revertProgress + 1,
    }));
    if (this.state.revertProgress == this.state.revertTotal){
      this.setState(
      {
        isReverting: false,
        revertProgress: 0,
        revertTotal: 0,
      })
    }
  }

  render(){
    if (!this.state.isReverting){
      return(
        <div>
          <center><h1>Input name of store below</h1></center>
          <center><h1>Reverting will remove all Flindel services from the store</h1></center>
          <input
            id="storeName"
            type="text"
         />
         <button onClick={() => this.handleClick()}>Revert Store</button>
        </div>
      )
    }
    else{
      return(
        <div>
          <center><h1>Reverting Store</h1></center>
          <center><h1>Do not close your browser</h1></center>
          <center><h1>{this.state.revertProgress}/{this.state.revertTotal}</h1></center>
        </div>
      )
    }
  }
}

export default Revert;
