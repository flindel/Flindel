import React, { Component } from "react";
import {
  postCollection,
  getShopID,
  postFulfillmentService,
  postGIT,
  put
} from "./Shopify";
//import {serveo_name} from '../config'
import SetupNavbar from "./SetupNavbar";
import { getUpdates } from "./FindIssues";
import Button from "@material-ui/core/Button";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;
let api_name = API_URL;

const text = {
  textAlign: "center",
  width: "400px"
};

const gitPara = {
  name: [
    "fulfillment_service",
    "grams",
    "inventory_management",
    "weight",
    "inventory_policy"
  ],
  value: ["flindel", 0, "shopify", 0, "deny"]
};

const normPara = {
  name: ["fulfillment_service", "grams", "weight"],
  value: ["flindel", 0, 0],
  defaultCorrection: ["manual", 100, 0.1]
};
let gitProducts = 0;
let gitPublished = 0;

//Dynamic Setup Process, only runs if the brand accidentally deletes GIT and Orig Collection
class OnboardProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      isLoading: false,
      gitCollectionId: props.gitCollectionId,
      extSetState: props.extSetState,
      gitProductIds: 0
    };
    this.callbackGit = this.callbackGit.bind(this);
    this.callbackOrig = this.callbackOrig.bind(this);
    this.finishedFixing = this.finishedFixing.bind(this);
    this.finishPublish = this.finishPublish.bind(this);

    const options = {
      method: "get",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    };
    this.getSetupStep();
  }

  //Step 1 of onboarding Process
  //Post GIT and Original collections
  //Post flindel fulfillment service
  async setup() {
    //store shop primary domain with .myshopify doamin in db
    //storeShopDomain();
    fetch(`${api_name}/shop/domain`, {
      method: "GET"
    })
      .then(res => {
        res.json();
      })
      .then(resj => {});
    this.setState({ isLoading: true });
    postCollection(
      {
        smart_collection: {
          title: "Get it Today",
          rules: [
            {
              column: "title",
              relation: "contains",
              condition: "Get it Today"
            }
          ]
        }
      },
      this.callbackGit
    );

    postCollection(
      {
        smart_collection: {
          title: "Original",
          rules: [
            {
              column: "title",
              relation: "not_contains",
              condition: "Get it Today"
            }
          ]
        }
      },
      this.callbackOrig
    ); //stores id of collection and posts GIT products
    //Changes normal products to the correct values
    postFulfillmentService();
  }

  //Step 4 of the onboarding Process
  //Publish all Get it Today Products
  //Posts script tags
  publish() {
    this.setState({ isLoading: true });
    this.publishAllGit();
    this.setupScriptTag();
  }

  //Publish ALl Get it Today
  publishAllGit() {
    fetch(
      `${api_name}/collections?id=${encodeURIComponent(
        this.state.gitCollectionId
      )}`,
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
        this.setState({ gitProductIds: gitProductIds });
        console.log("PUBLISHING GET IT TODAY: ", gitProductIds);
        gitProductIds.map(id => {
          put(
            id,
            {
              product: {
                id: id,
                published_at: "2007-12-31T19:00:00-05:00"
              }
            },
            this.finishPublish
          );
        });
      });
  }

  //tracks progress of publishing
  finishPublish() {
    gitPublished += 1;
    if (gitPublished == this.state.gitProductIds.length) {
      this.completeStep(5);
      this.setState({ isLoading: false });
      this.state.extSetState({ ui: 0 }); //Update Products App
    }
  }

  //1. Get scriptTag url from DB 2.post to shopify 3.Update scriptTag id in DB 4.update status as "active" in DB
  async setupScriptTag() {
    //get urls from DB
    let respArray = [];
    let srcTemp = await fetch(`${api_name}/scriptTag/db/src`, {
      method: "get"
    });
    let srcJson = await srcTemp.json();
    //for each url, post scriptTag to shopify endpoint
    for (let i = 0; i < srcJson.length; i++) {
      let postTemp = await fetch(`${api_name}/scriptTag/shopify`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          script_tag: {
            event: "onload",
            src: srcJson[i]
          }
        })
      });
      let postJson = await postTemp.json();
      respArray.push(postJson.script_tag);
      console.log("scriptTag posted " + respArray[i].src);
    }
    //update id and other info to DB
    let respString = JSON.stringify(respArray);
    let putDBTemp = await fetch(
      `${api_name}/scriptTag/db/updateid?resp=${encodeURIComponent(
        respString
      )}`,
      {
        method: "put"
      }
    );
    let putDBJson = await putDBTemp.json();
  }

  //stores id of GIT collection after it has been creates
  callbackGit(data) {
    this.setState({ gitCollectionId: data.smart_collection.id });
  }

  //stores id of Original Collection after it has been collected
  //Makes api request to shopify to get origianl products and create GIT products unpublished
  callbackOrig(data) {
    this.setState({ origCollectionId: data.smart_collection.id });
    this.getOrigProducts(data.smart_collection.id);
  }

  //Gets onboarding step from firestore.
  //Moves Brand to correct onboarding step based on firestore value
  async getSetupStep() {
    var temp;
    temp = await fetch(`${api_name}/shop/onboardingStep`, {
      method: "get"
    });
    var json = await temp.json();
    if (json._fieldsProto.onboardingStep === undefined) {
      console.log("onboardingStep is undefined");
      this.postSetupStep(1);
      this.setState({ step: 1 });
    } else {
      let step = json._fieldsProto.onboardingStep.integerValue;
      this.setState({ step: step });
      if (step == 5) {
        this.state.extSetState({ ui: 0 }); //Go to Update Products App
      }
    }
    return json;
  }

  //Writes step to firestore onboardingStep
  postSetupStep(step) {
    fetch(
      `${api_name}/shop/onboardingStep?body=${encodeURIComponent(
        JSON.stringify({ onboardingStep: step })
      )}`,
      {
        method: "post"
      }
    );
  }

  //Using original collection id, find all products in that collection
  //Then create a Get it Today version of that product and correct the weight if it is 0kg.
  getOrigProducts(origCollectionId, loopCount = 0) {
    //Assumption, Brand has less than 250 products
    fetch(
      `${api_name}/collections?id=${encodeURIComponent(origCollectionId)}`,
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
        console.log("Original Products", resData);
        if (resData.products.length != 0) {
          this.setState({ origCollection: resData });
          for (let j = 0; j < resData.products.length; j++) {
            this.fixGitDne(resData.products[j]);
            this.fixNormDefaultPara(resData.products[j]);
          }
        } else {
          if (loopCount < 10) {
            //Retries API call if nothing is returned, up to 10 times
            console.log("Retry get collection", loopCount);
            loopCount++;
            this.getOrigProducts(origCollectionId, loopCount);
          } else {
            console.error(
              "Original products collection is empty or API error."
            );
          }
        }
      })
      .catch(error => console.log(error));
  }
  //Returns true if all variants require shipping
  //Returns false if any variant does not require shipping
  checkRequiresShipping(product) {
    for (let i = 0; i < product.variants.length; i++) {
      if (!product.variants[i].requires_shipping) {
        return false;
      }
    }
    return true;
  }
  //Creates a dublicate of original product and posts it to shopify and firestore
  fixGitDne(norm) {
    if (this.checkRequiresShipping(norm)) {
      let gitBody = JSON.parse(JSON.stringify(norm));
      gitBody.published_at = null;
      gitBody.title = norm.title + " - Get it Today";
      for (let j = 0; j < norm.variants.length; j++) {
        gitBody.variants[j].old_inventory_quantity = 0;
        gitBody.variants[j].inventory_quantity = 0;
        gitBody.variants[j].sku = gitBody.variants[j].id;
        for (let i = 0; i < gitPara.name.length; i++) {
          eval(
            "gitBody.variants[" +
              j +
              "]." +
              gitPara.name[i] +
              " = gitPara.value[i]"
          );
        }
      }
      let body = { product: gitBody };
      postGIT(body, { product: norm }, this.finishedFixing);
    }
  }

  /*Sets parameters of an original product to a default value if it conflicts
  get it today, default values are specified in normPara JSON*/
  fixNormDefaultPara(norm) {
    let normBody = JSON.parse(JSON.stringify(norm));
    for (let j = 0; j < norm.variants.length; j++) {
      if (normBody.variants[j].grams == 0) {
        normBody.variants[j].weight_unit = "kg";
      }
      for (let i = 0; i < normPara.name.length; i++) {
        if (
          eval(
            "normBody.variants[" +
              j +
              "]." +
              normPara.name[i] +
              " == normPara.value[i]"
          )
        ) {
          eval(
            "normBody.variants[" +
              j +
              "]." +
              normPara.name[i] +
              " = normPara.defaultCorrection[i]"
          );
        }
      }
    }
    let body = { product: normBody };
    put(norm.id, body);
  }

  //Tracks progress of the posting of git products
  finishedFixing() {
    gitProducts += 1;
    console.log("Fixed: ", gitProducts);
    if (gitProducts == this.state.origCollection.products.length) {
      this.completeStep(2);
      this.setState({ isLoading: false });
    }
  }

  //Updates Setup step number in client state and onBoardingStep in Firestore
  completeStep(stepNum) {
    this.setState({ step: stepNum });
    this.postSetupStep(stepNum);
  }

  render(props) {
    let page = <div></div>;
    if (this.state.step == 1) {
      page = (
        <div>
          <h1>The following changes will be made to your store</h1>
          <center>
            <ol
              style={{
                textAlign: "center",
                width: "300px"
              }}
            >
              <li style={text}>
                An unpublished duplicate of all products on your store, for “Get
                it Today” (These products will only be visible after setup is
                complete)
              </li>
              <li style={text}>
                A smart collection called "Original" containing all of your
                brand’s current products.
              </li>
              <li style={text}>
                A smart collection called "Get it Today" containing all products
                offered on “Get it Today”.
              </li>
              <li style={text}>
                A fulfillment service called “Flindel”. Used to fulfill “Get it
                Today” products.
              </li>
            </ol>
          </center>
          <h1>The following elements of your store will be changed</h1>
          <center>
            <ol
              style={{
                textAlign: "center",
                width: "300px"
              }}
            >
              <li style={text}>
                If any product variants have a weight of 0kg, it will be set to
                0.1kg.
              </li>
            </ol>
          </center>
          <br />
          <div>
            <Button
              variant="contained"
              onClick={() => {
                this.setup();
              }}
              color="secondary"
            >
              Make Changes to Store
            </Button>
          </div>
          <br />
          <br />
        </div>
      );
    }
    if (this.state.step == 2 || this.state.step == 3) {
      page = (
        <div>
          <h1>
            Please follow the steps below to create UI elements for Get it Today
            and Flindel Returns.
          </h1>
          <center>
            {this.state.step == 3 && <h1>THEME AWAITING APPROVAL</h1>}
            <ol
              style={{
                textAlign: "center",
                width: "300px"
              }}
            >
              <li style={text}>
                Create a duplicate of your current store theme
              </li>
              <img
                src="https://imgur.com/zIqLR98.png"
                title="source: imgur.com"
                width="400px"
              />

              <li style={text}>
                Press "customize" located to the right of copy of your current
                store theme.
              </li>
              <img
                src="https://imgur.com/tydT5lP.png"
                title="source: imgur.com"
                width="400px"
              />

              <li style={text}>
                Create custom element so users can navigate to the Get it Today
                product collection. Feel free to place Get it Today wherever
                works for your storefront. In the example below, we linked to
                Get it Today in the navigation bar.
              </li>
              <img
                src="https://imgur.com/Yg8zrCr.png"
                title="source: imgur.com"
                width="400px"
              />

              <li style={text}>
                For Flindel Returns, please inform us if your refund policy is
                located outside of Shopify’s legal pages, located within the
                settings of Shopify admin.
              </li>

              <li style={text}>
                Exit the theme editor and navigate back to your theme library.
              </li>
              <img
                src="https://imgur.com/tydT5lP.png"
                title="source: imgur.com"
                width="400px"
              />

              <li style={text}>
                To the right of the copy of your store theme click actions, and
                then select “Preview” from the drop down menu.
              </li>
              <img
                src="https://imgur.com/VxSJfBr.png"
                title="source: imgur.com"
                width="400px"
              />

              <li style={text}>
                In the bottom right of the preview page, select “Share preview”
              </li>
              <img
                src="https://imgur.com/dxnZK0f.png"
                title="source: imgur.com"
                width="400px"
              />

              <li style={text}>
                Copy the link provided and send it to brandsupport@flindel.com
              </li>

              <li style={text}>
                Once your design has been approved you will be informed, and can
                move on to the last step.
              </li>
            </ol>
          </center>
          <br />
          {this.state.step == 3 ? (
            <div>
              <h1>THEME AWAITING APPROVAL</h1>
              <Button
                disabled
                variant="contained"
                onClick={() => {
                  alert("");
                }}
                color="secondary"
              >
                Next
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="contained"
                onClick={() => {
                  alert(
                    "Please send brandsupport@flindel.com the link to your unpublished store theme."
                  );
                  this.completeStep(3);
                }}
                color="secondary"
              >
                Next
              </Button>
            </div>
          )}
          <br />
          <br />
        </div>
      );
    }
    if (this.state.step == 4) {
      page = (
        <div>
          <center>
            <ol
              style={{
                textAlign: "center",
                width: "300px"
              }}
            >
              <li style={text}>
                To the right of the copy of your store theme click actions, and
                then select “Publish” from the drop down menu.
              </li>
              <img
                src="https://imgur.com/VxSJfBr.png"
                title="source: imgur.com"
                width="400px"
              />
              <li style={text}>
                Immediately after publishing your store theme, press the
                “Publish” button located below to make Flindel Services
                available for your customers.
              </li>
            </ol>
          </center>
          <br />
          <div>
            <Button
              variant="contained"
              onClick={() => {
                alert("Please ensure you have published your new store theme.");
                this.publish();
              }}
              color="secondary"
            >
              Publish
            </Button>
          </div>
        </div>
      );
    }
    if (this.state.isLoading == true) {
      page = <h1>Loading</h1>;
    }
    return (
      <div>
        <br />
        <img
          src={
            "https://img1.wsimg.com/isteam/ip/d1c9d8c1-59ec-45a1-aa09-ca2bc858ce7e/logo/5afca41c-20da-4604-b5a0-7e3d7c35da34.png/:/rs=h:248/qt=q:95"
          }
          width="150px"
        />
        <SetupNavbar step={this.state.step} />
        <br />
        <br />
        <br />
        <br />
        {page}
      </div>
    );
  }
}
export default OnboardProcess;
