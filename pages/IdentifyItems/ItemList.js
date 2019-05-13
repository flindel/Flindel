import React, { Component } from 'react';
import Item from "./Item";

//const items = []; //productid  name  quantity  returnQuantity imgSrc

class ItemList extends Component {
    constructor(props){
        super(props);
        this.state={
            view:'selectItem', //"selectReason" "summary"  a state to control render content
        }
        this.currItem = {
            Kproductid:"",
            Kvariantid:"",
            Kname: "",
            Kvalue:"",
            Ksrc: "",
            Kquantity: ""
        }
        this.returnItems = [];
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e){

    }

    //get return items
    handleSelect(productid, variantid, name, value, src, quantity){
        let findItem=false;
        this.currItem = {
            Kproductid: productid,
            Kvariantid: variantid,
            Kname: name,
            Kvalue: value,
            Ksrc: src,
            Kquantity: quantity
        }

        //add currItem to returnItems if currItem does not exsit in returnItems,
        //if currItem already exsits in returnItems, change the it value based on selected value

        if(JSON.stringify(this.returnItems)=="[]"){
            this.returnItems.push(this.currItem);
            console.log("Add First return Item:"+JSON.stringify(this.returnItems))
            return
        }

        this.returnItems.forEach((returnItem)=>{
            if(this.currItem.Kvariantid == returnItem.Kvariantid){
                findItem = true
                if(returnItem.Kvalue!=this.currItem.Kvalue){
                    returnItem.Kvalue=this.currItem.Kvalue
                }
            }
        })

            if(findItem==false){
                    this.returnItems.push(this.currItem);
            }


       console.log("RETURN ITEMS with Zero value"+JSON.stringify(this.returnItems));
       //console.log(this.currItem)

    }

    render() {
        
        
        return (
            <div className="ItemList">
                {this.props.items.map((item)=>{
                    return <Item item={item} key={item.productID} handleSelect={this.handleSelect.bind(this)}/>
                })}

                <button onClick={this.handleClick}>CONFIRM</button>
            

            </div>
         );
        
    
    }
}

export default ItemList;