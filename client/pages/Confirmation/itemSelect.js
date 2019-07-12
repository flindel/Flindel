import React, { Component } from 'react';
import Item from "./Item2";
import './universal.css'

/*
SELECTION PAGE
This is where the customer first selects the items they would like to return
*/

class ItemList extends Component {
    constructor(props){
        super(props);
        this.currItem = {
            productID:"",
            variantid:"",
            name: "",
            value:"",
            src: "",
            quantity: "",
            price:"",
            reason: ""
        }
        this.state = {
            errorMessage:'',
            style:'Blackout2',
        }
        this.returnItems = [];
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(){
        if (this.returnItems.length == 0){
            this.setState({errorMessage: '*ERROR: Please select one or more items to return in order to continue*'})
        }
        else {
            this.props.setReturnList(this.returnItems)
            this.props.handleSubmit()
        }
    }

    //get return items
    async handleSelect(productidX, variantidX, nameX, valueX, srcX, quantityX, priceX, reasonX){
        let findItem=false;
        this.currItem = {
            productID: productidX,
            variantid: variantidX,
            name: nameX,
            value: valueX,
            src: srcX,
            quantity: quantityX,
            price: priceX,
            reason: reasonX
        }
        //update return list
            for (var i = 0;i<this.returnItems.length;i++){
                let temp = this.returnItems[i];
                if (temp.variantid == this.currItem.variantid){
                    await this.returnItems.splice(i,1)
                }
            }
            /*for (var i = 0;i<this.currItem.value;i++){ //multiple of same item
                await this.returnItems.push(this.currItem)
            }*/
            if (this.currItem.value > 0){
                await this.returnItems.push(this.currItem) 
            }
 
            //change the button to allow submit or not
            if (this.returnItems.length > 0){
                this.setState({style:'Submit2'})
            }
            else{
                this.setState({style:'Blackout2'})
            }

    }
    render() { 
        return (
            <div className="ItemList">
                <p className = 'errorMessage'>{this.state.errorMessage}</p>
                <fieldset className = 'page2'>
                    <p className = 'orderHeader'>Order Number: {this.props.orderNum}</p>
                {this.props.items.map((item)=>{
                    return <Item item={item} serveoname={this.props.serveoname} step = {1} key={item.variantID} handleSelect={this.handleSelect.bind(this)}/>
                })}
                </fieldset>  
                <br/>
                <button className = {this.state.style} onClick={this.handleSubmit}>CONTINUE</button>            
            </div>
         );  
    }
}

export default ItemList;