import React, { Component } from 'react';
import './universal.css'
import Select from 'react-select';

class Item extends Component {
    //constructor/binding methods
    constructor(props){
        super(props) ;
        this.state = {
            productid: this.props.item.productID,
            variantid: this.props.item.variantID,
            name: this.props.item.name,
            title: this.props.item.title,
            variantTitle: this.props.item.variantTitle,
            value: "0",  //the quantity that user wants to return
            src:"",
            price: this.props.item.price,
            reason: this.props.item.reason,
            quantity: this.props.item.quantity,//the quantity of a item that user total brought
            status: this.props.item.status,
            activeReason: [],
            //potential reasons for return
            reasons: [
                { value: "Broken", label: "Item is broken." },
                { value: "Wrong", label: "Item is wrong." },
                { value: "Unhappy", label: "Item is unsatisfactory." },
                { value: "Multiple", label: "Multiple reasons"}
              ],
              //potential quantities - this holds single return value, stored like this because it's a different component
            activeQuantity:[],
            quantities:[]
        };
        this.setState = this.setState.bind(this)
        this.handleReasonChange = this.handleReasonChange.bind(this);
        this.handleQuantityChange=this.handleQuantityChange.bind(this);
        this.handleStatusChange=this.handleStatusChange.bind(this)
        this.handleQuantityChangeSortingCenter=this.handleQuantityChangeSortingCenter.bind(this)
    }

    //handle selecting a change in quantity
    handleQuantityChange(option){
        //use callback to pass select item since setState is asyn
        this.setState(state => {
            return {
              activeQuantity: option
            };
          });
        this.setState({
            value:option.value
        },()=>this.props.handleSelect(this.state.productid, this.state.variantid, this.state.name, 
            this.state.title, this.state.variantTitle,
            this.state.value, this.state.src, this.state.quantity, this.state.price, this.state.reason))
    }

    //handle inputting the reason for return
    handleReasonChange(option){
        let old = this.state.reason
        this.setState(state => {
            return {
              activeReason: option
            };
          });
         this.setState({
                 reason:option.value
         },()=> this.props.handleSelect(this.props.item.variantid, this.state.reason, old))
     }

     //change status of item (done by sorting center)
     handleStatusChange(e){
         let old = this.state.status
         this.setState({
            status:e.target.value
        },()=> this.props.handleSelect(this.props.item.variantid, this.state.status, old))
     }

     handleQuantityChangeSortingCenter(e){
        this.props.handleQuantityChange(e.target.value, this.props.item.variantid)
     }

     //on mount, get important information including image source to show the display picture
    async componentWillMount(){
        var imageID = this.props.item.productID
        if (this.props.step == 4 || this.props.step == 5){ 
            let temp = await fetch(`https://${this.props.serveoname}/products/variant/productID?store=${encodeURIComponent(this.props.item.store)}&id=${encodeURIComponent(this.props.item.variantid)}`, {
            method: 'get',
            })
            let tJSON = await temp.json()
            imageID = tJSON.variant.product_id
        }
        fetch(`https://${this.props.serveoname}/products/img?id=${encodeURIComponent(imageID)}`, {
        method: 'GET',})
        .then(response => response.json())
        .then(resData=>{
        if(resData.product){
          if(resData.product.image){
            this.setState({
                    src: resData.product.image.src
            })
            }
          }
        });
        //push quantity array
        let quantityArr = [];
            for(let i=0; i<=this.state.quantity; i++){
                let temp = {value: i, label: i}
                quantityArr.push(temp);
            };
        this.setState({quantities:quantityArr})
    }


    render() {
        //get total quantity from state and pass it to return quantity
        //conditional render based on which step it's called from so the necessary information can be displayed
        let quantityArr = [];
            for(let i=0; i<=this.state.quantity; i++){
                quantityArr.push(i);
            };
        let quantityOption = quantityArr.map((quantity, index)=>{
            return <option value={quantity} key={index}>{quantity}</option>
        })
        if (this.props.step == 1)
        {
            //quantity == 0: black out item, can't select it, don't display quantity bar
            if (this.state.quantity == 0){
                return (
                    <div className="itemContainer"> 
                        {/*<hr className = 'hl4'></hr> */}
                        <div className = 'container1Grey'>
                            <img className = 'item2' src={this.state.src} />
                        </div>
                        {/* dropdown menu to choose return quantity */}
                        <div className = 'container2Grey'>
                            
                            <p className = 'item2 title'>{this.props.item.title}</p>
                            <p className = 'item2 variantTitle'>{this.props.item.variantTitle}</p>
                        </div>
                        <div className = 'container3Grey'>
                            
                            <p className = 'item2 noReturnMsg'>This item is past store return policy and can't be returned.</p>
                        </div>
                        
                    </div>
                );
            }
            else{
                //quantity > 0 ... selectable, display normal with quantity dropdown
                return (
                    <div className="itemContainer">
                        {/*<hr className = 'hl4'></hr> */}
                        <div className = 'container1'>
                            <img className = 'item2' src={this.state.src} />
                        </div>
                        {/* dropdown menu to choose return quantity */}
                        <div className = 'container2'>
                            
                            <p className = 'item2 title'>{this.props.item.title}</p>
                            <p className = 'item2 variantTitle'>{this.props.item.variantTitle}</p>
                        </div>
                        <div className = 'container3'>
                        <label >Quantity for Return: </label>
                            <Select className = 'qty' placeholder = {'0'}value={this.state.activeQuantity} onChange={this.handleQuantityChange} options = {this.state.quantities}>
                            </Select>
                        </div>
                      
                    </div>
                );
            }
        }
        //second trip through of item ... select reason
        else if (this.props.step == 2){
            return (
                <div className="itemContainer">
                    <div className = 'container1'>
                        <img className = 'item2' src={this.state.src} />
                    </div>
                    <div className = 'container2'>
                        <p className = 'item2 title'>{this.props.item.title}</p>
                        <p className = 'item2 variantTitle'>{this.props.item.variantTitle}</p>
                      
                        <p className = 'item2'>QTY:  {this.props.item.value}</p>
                    </div>
                    <div className = 'container3'>
                        {/* dropdown menu to choose return reason */}
                        <label>Reason for return:
                            <Select placeholder = {'Reason'}value={this.state.activeReason} onChange={this.handleReasonChange} options = {this.state.reasons}>
                            </Select>
                        </label>
                    </div>
                </div>
            );
        }
        //third time through item - display confirmation, no dropdown
        else if (this.props.step == 3){
            return(
                <div className="itemContainer">
                    <div className ='container1'>
                        <img className = 'item2' src={this.state.src} />
                    </div>
                    <div className ='container2'>
                        <p className = 'item2 title'>{this.props.item.title}</p>
                        <p className = 'item2 variantTitle'>{this.props.item.variantTitle}</p>
                    {
                        //show item.quantity as QTY in review page, show item.value as QTY in confirmation page
                        this.props.review?(<p className = 'item2'>QTY: {this.props.item.quantity}</p>):(<p className = 'item2'>QTY: {this.props.item.value}</p>)
                    }
                        
                    </div>
                    <div className ='container3'>
                        
                        <p className = 'item2 '>Reason:{this.props.item.reason}</p>
                    </div>
                   
                </div>
            );
        }
        //this method used by sorting centre to display
        else if (this.props.step == 4){
            return(
                <div className = "itemContainer">
                    <div className ='container1'>
                        <img className = 'item2' src = {this.state.src}/>
                    </div>
                    <div className ='container2'>
                        <p className = 'item' >{this.props.item.name}: {this.props.item.variantid} </p>
                        <br/>
                        <p className = 'item'>Reason: {this.props.item.reason}</p>
                    </div>
                    <div className ='container3'>
                        <br/>
                        <label>Change Status:
                            <select value={this.state.status} onChange={this.handleStatusChange}>
                                <option value="submitted">Submitted</option>
                                <option value="accepted">Accepted - Resell</option>
                                <option value="returning">Accepted - No Resell</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </label>
                    </div>
                </div>
            )
        }
        else if (this.props.step == 5){
            return(
                <div className = 'itemContainer'>
                    <div className ='container1'>
                        <img className = 'item2' src = {this.state.src}/>
                    </div>
                    <div className ='container2'>
                        <p className = 'item' >{this.props.item.name}: {this.props.item.variantid} </p>
                        <br/>
                        <p className = 'item'> Store: {this.props.item.store}</p>
                    </div>
                    <div className ='container3'>
                        <p className = 'item'>Expected Quantity: {this.props.item.quantity}</p>
                        <br/>
                        <p className = 'item'>Received Quantity: 
                        <label>     
                            <input className = 'numInput' value={this.props.item.value} onChange={this.handleQuantityChangeSortingCenter} />
                        </label>
                        </p>
                    </div>
                    <br/>
                    <br/>
                </div>
            )
        }
    }
}

export default Item;
