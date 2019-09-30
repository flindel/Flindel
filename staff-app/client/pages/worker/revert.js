"use strict";
import React from "react";
import Select from "react-select";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;

class Revert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shop: "",
      isReverting: false,
      revertProgress: 0,
      revertTotal: 0,
      stores: [],
      activeStore: []
    };

    this.handleStoreChange = this.handleStoreChange.bind(this);
    this.finishedReverting = this.finishedReverting.bind(this);
  }

  async componentDidMount() {
    let temp = await fetch(`${API_URL}/shop/all`, {
      method: "get"
    });
    let tJSON = await temp.json();
    let stores = [];
    for (var i = 0; i < tJSON.length; i++) {
      let tempStore = {
        value: tJSON[i],
        label: tJSON[i] + ".myshopify.com"
      };
      stores.push(tempStore);
    }
    this.setState({ stores: stores });
  }

  async revert(shop) {
    this.setState({ isReverting: true });
    //get fulfillment service ID
    const fulservId = await this.getFulfillmentService(shop);
    console.log("Hello");
    console.log("fulservId: ", fulservId);
    this.deleteFulserv(fulservId, shop);
    this.revertScriptTag(shop);
    this.getGitCollectionId(shop);
    //in callback it deletes all git products and deletes git collection
  }

  handleStoreChange(option) {
    this.setState(state => {
      return {
        activeStore: option
      };
    });
    this.setState({ shop: option.value });
  }

  async getFulfillmentService(shop = this.state.shop) {
    console.log("Shop", shop);
    var temp = await fetch(
      `${API_URL}/revert/fulserv/firestore/id?shop=${encodeURIComponent(
        shop
      )}`,
      {
        method: "get"
      }
    );
    console.log("temp: ", temp);
    if (temp) {
      var json = await temp.json();
      if (json._fieldsProto) {
        if (json._fieldsProto.fulfillment_service) {
          return json._fieldsProto.fulfillment_service.integerValue;
        }
      }
    }
  }

  del(product_id, shop, callback = doNothing) {
    fetch(
      `${API_URL}/revert/products?id=${encodeURIComponent(
        product_id
      )}&shop=${encodeURIComponent(shop)}`,
      {
        method: "delete"
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      })
      .then(data => {
        console.log("DELETE: ", data);
        this.delProduct("" + product_id); //removes from FIRESTORE
        callback(data);
      })
      .catch(error => console.log(error));
  }

  async delProduct(gitID) {
    var temp;
    temp = await fetch(
      `${API_URL}/firestore/product/git/?gitID=${encodeURIComponent(gitID)}`,
      {
        method: "delete"
      }
    );
  }

  async getGitCollectionId(shop) {
    fetch(
      `${API_URL}/revert/collections/all/?shop=${encodeURIComponent(shop)}`,
      {
        method: "get"
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      })
      .then(data => {
        console.log("GET Collection: ", data);
        const smart_collections = data.smart_collections;
        console.log("Smart Collections", smart_collections);
        for (let i = 0; i < smart_collections.length; i++) {
          if (smart_collections[i].title == "Get it Today") {
            console.log("Git Collection ID", smart_collections[i].id);
            this.deleteAllGitProducts(smart_collections[i].id, shop);
            this.deleteGitCollect(smart_collections[i].id, shop);
          }
        }
      })
      .catch(error => console.log(error));
  }

  deleteGitCollect(gitCollectionId, shop) {
    fetch(
      `${API_URL}/revert/collections?id=${encodeURIComponent(
        gitCollectionId
      )}&shop=${encodeURIComponent(shop)}`,
      {
        method: "delete"
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      })
      .then(data => {
        console.log("DELETE Smart Collection: ", data);
      })
      .catch(error => console.log(error));
  }

  deleteFulserv(fulservId, shop) {
    fetch(
      `${API_URL}/revert/fulserv?id=${encodeURIComponent(
        fulservId
      )}&shop=${encodeURIComponent(shop)}`,
      {
        method: "delete"
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      })
      .then(data => {
        console.log("DELETE Fulfillment Service: ", data);
      })
      .catch(error => console.log(error));
  }

  deleteAllGitProducts(gitCollectionId, shop) {
    //Delete all Get it Today
    fetch(
      `${API_URL}/revert/collections?id=${encodeURIComponent(
        gitCollectionId
      )}&shop=${encodeURIComponent(shop)}`,
      {
        method: "GET"
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error(response.statusText);
        }
      })
      .then(resData => {
        let gitProductIds = resData.products.map(product => {
          return product.id;
        });
        this.setState({ revertTotal: gitProductIds.length });
        console.log("DELETE GIT Products: ", gitProductIds);
        gitProductIds.map(id => {
          this.del(id, shop, this.finishedReverting);
        });
      })
      .catch(error => console.log(error));
  }

  //1.get all ids from db 2.delete scriptTag from Shopify by id 3. Update status as "revert" in DB
  async revertScriptTag(shop) {
    //get all ids and save in idsArray
    let scripttagIDTemp = await fetch(
      `${API_URL}/revert/scriptTag/db/ids?shop=${encodeURIComponent(shop)}`,
      {
        method: "get"
      }
    );
    let scripttagIDJson = await scripttagIDTemp.json();
    const idsArray = scripttagIDJson.ids;
    //for each id, delete from shopify
    for (let i = 0; i < idsArray.length; i++) {
      console.log(idsArray[i]);
      let deleteTemp = await fetch(
        `${API_URL}/revert/scriptTag/shopify?id=${encodeURIComponent(
          idsArray[i]
        )}&shop=${encodeURIComponent(shop)}`,
        {
          method: "delete"
        }
      );
      let deleteJson = await deleteTemp.json();
      console.log(`${idsArray[i]} is deleted ${deleteJson}`);
    }
    //update status as "revert" in database
    let statusTemp = await fetch(
      `${API_URL}/revert/scriptTag/db/status?shop=${encodeURIComponent(shop)}`,
      {
        method: "get"
      }
    );
    let revertResp = await statusTemp.json();
    if (revertResp.success) {
      console.log("ScriptTags deleted");
    }
  }

  async handleClick() {
    let textValue = document.getElementById("storeName").value;
    var confirmed = confirm(
      "This will remove all Flindel Services from " +
        textValue +
        ". \nAre you sure you want to proceed?"
    );
    if (confirmed) {
      textValue = textValue + ".myshopify.com";
      this.setState({ shop: textValue });
      const fulservId = await this.getFulfillmentService(textValue);
      if (fulservId) {
        console.log("fulservId +", fulservId);
        console.log("this.state.shop", this.state.shop);
        this.revert(textValue);
      } else {
        alert(
          'Invalid Store Name, Please do not include ".myshopify.com" in the text box.'
        );
        console.log("fulservId -", fulservId);
      }
      //this.revert();
    }
  }

  finishedReverting(data) {
    console.log("revertProgress", this.state.revertProgress);
    this.setState(state => ({
      revertProgress: state.revertProgress + 1
    }));
    if (this.state.revertProgress == this.state.revertTotal) {
      this.setState({
        isReverting: false,
        revertProgress: 0,
        revertTotal: 0
      });
    }
  }

  render() {
    if (!this.state.isReverting) {
      return (
        <div>
          <center>
            <h1>Input name of store below</h1>
          </center>
          <center>
            <h1>Reverting will remove all Flindel services from the store</h1>
          </center>
          <div className="workerStoreBar">
            <Select
              placeholder={"Select store..."}
              isSearchable={false}
              value={this.state.activeStore}
              options={this.state.stores}
              onChange={this.handleStoreChange}
            />
          </div>
          <button onClick={() => this.handleClick()}>Revert Store</button>
          <br />
          <br />
          <br />
          <button onClick={this.props.back}>BACK</button>
        </div>
      );
    } else {
      return (
        <div>
          <center>
            <h1>Reverting Store</h1>
          </center>
          <center>
            <h1>Do not close your browser</h1>
          </center>
          <center>
            <h1>
              {this.state.revertProgress}/{this.state.revertTotal}
            </h1>
          </center>
        </div>
      );
    }
  }
}
export default Revert;
