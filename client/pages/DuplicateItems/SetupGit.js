
import React, { Component } from 'react';
import {postCollection, getShopID, postScriptTag, postFulfillmentService} from './Shopify';
import {postInstallTime} from './Firestore';
import {script_tag_url, script_tag_url_returnPortal} from '../config'

import Button from '@material-ui/core/Button';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DateTimePicker from 'material-ui-datetimepicker';
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog'
import TimePickerDialog from 'material-ui/TimePicker/TimePickerDialog';

class SetupGit extends Component {
  constructor(props){
    super(props);
    this.state = {
      isGitCollectSetup: props.gitCollectionId != 0,
      isOrigCollectSetup: props.origCollectionId != 0,
      isFulfillSetup: false,
      extSetState: props.extSetState,
      shop_id: null,
      install_time: null,
    }
    this.callbackGit = this.callbackGit.bind(this);
    this.callbackOrig = this.callbackOrig.bind(this);
    this.setShopID = this.setShopID.bind(this);
    getShopID(this.setShopID);
  }

  setShopID(data){
    this.setState(
      {
        shop_id: data.shop_id,
        install_time: data.install_time,
      }
    )
  }

  setDate(dateTime){
    this.setState({install_time: dateTime})
    console.log("dateTime", dateTime);
    const body = {
      shop_id: this.state.shop_id,
      install_time: dateTime,
    }
    console.log("BODY: ", body)
    postInstallTime(body);
  }

  setup(){
    if (!this.state.isGitCollectSetup) {
      postCollection({
        "smart_collection": {
          "title": "Get it Today",
          "rules": [
            {
              "column": "title",
              "relation": "contains",
              "condition": "Get it Today"
            }
          ],
        }
      }, this.callbackGit)
    }
    if (!this.state.isOrigCollectSetup) {
      postCollection({
        "smart_collection": {
          "title": "Original",
          "rules": [
            {
              "column": "title",
              "relation": "not_contains",
              "condition": "Get it Today"
            }
          ],
        }
      }, this.callbackOrig)
    }
    postFulfillmentService();
  }

  callbackGit(data){
    this.state.extSetState({gitCollectionId: data.smart_collection.id})
  }

  callbackOrig(data){
    this.state.extSetState({origCollectionId: data.smart_collection.id})
  }

  render(props){
    let picker = null;
    let bottom = null;
    if (this.state.install_time != null){
        bottom =
        <div>
          <h4>Flindel Setup Scheduled: {this.state.install_time.toString()}</h4>
          <Button variant="contained" onClick={() => console.log("He")} color="primary">Cancel Setup</Button>
        </div>;

    } else {
      bottom =
        <div>
          <Button variant="contained" onClick={() => this.setup()} color="primary">Setup Now</Button>
          <MuiThemeProvider>
            <DateTimePicker
              onChange={(dateTime) => this.setDate(dateTime)}
              value={"Setup Later"}
              DatePicker={DatePickerDialog}
              TimePicker={TimePickerDialog}
            />
          </MuiThemeProvider>
        </div>;
    }
    return (
      <div>
        <h1>Flindel Setup</h1>
        <h4>Changes to your store:</h4>
        <ol>
          {!this.state.isOrigCollectSetup&&<li>Product collection "Original" will be added to your store</li>}
          {!this.state.isGitCollectSetup&&<li>Product collection "Get it Today" will be added to your store</li>}
          <li>A Flindel fulfillment service for "Get it Today" products will be added to your store.</li>
        </ol>
        {bottom}
      </div>
    )
  }
}
export default SetupGit;
