import React, { Component } from 'react';
import './universal.css'
import {Card, AppProvider, Button, ProgressBar, TextField} from '@shopify/polaris';
import Select from 'react-select';

class Item extends Component {
    //constructor/binding methods
    constructor(props){
        super(props) ;
        this.state = {
            productid: this.props.item.productID,
            variantid: this.props.item.variantID,
            name: this.props.item.name,
            value: "0",  //the quantity that user wants to return
            src:"",
            price: this.props.item.price,
            reason: this.props.item.reason,
            quantity: this.props.item.quantity,//the quantity of a item that user total brought
            status: this.props.item.status,
            activeReason: [],
            reasons: [
                { value: "Broken", label: "Item is broken." },
                { value: "Wrong", label: "Item is wrong." },
                { value: "Unhappy", label: "Item is unsatisfactory." }
              ],
            activeQuantity:[],
            quantities:[]
        };
        this.setState = this.setState.bind(this)
        this.handleReasonChange = this.handleReasonChange.bind(this);
        this.handleQuantityChange=this.handleQuantityChange.bind(this);
        this.handleStatusChange=this.handleStatusChange.bind(this)
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

     handleStatusChange(e){
         let old = this.state.status
         this.setState({
            status:e.target.value
        },()=> this.props.handleSelect(this.props.item.variantid, this.state.status, old))
     }

     //on mount, get important information including image source to show the display picture
    componentWillMount(){
        if(this.props.step !=4){
            fetch(`https://${this.props.serveoname}/products?id=${encodeURIComponent(this.props.item.productID)}`, {
            method: 'GET',})
        .then(response => response.json())
        .then(resData=>{
        if(resData.product){
            this.setState({
                    src: resData.product.image.src
            })

            }
        });
        }
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
        return (
            <div>
                <hr className = 'hl4'></hr>
                <div className = 'container1'>
                    <img className = 'item2' src={this.state.src} />
                </div>
                {/* dropdown menu to choose return quantity */}
                <div className = 'container2'>
                    <br/>
                    <p className = 'item2'><strong>{this.props.item.name}</strong></p>
                </div>
                <div className = 'container3'>
                <label >Quantity for Return: </label>
                    <Select className = 'qty' placeholder = {'0'}value={this.state.activeQuantity} onChange={this.handleQuantityChange} options = {this.state.quantities}>
                    </Select>
                </div>
                <br/>
            </div>
        );
        }
        else if (this.props.step == 2){
            return (
                <div>
                    <hr className = 'hl4'></hr>
                    <div className = 'container1'>
                        <img className = 'item2' src={this.state.src} />
                    </div>
                    <div className = 'container2'>
                        <p className = 'item2'><strong>{this.props.item.name}</strong></p>
                        <br/>
                        <p className = 'item2'><strong>QTY: </strong> {this.props.item.value}</p>
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
        else if (this.props.step == 3){
            return(
                <div>
                    <hr className = 'hl4'></hr>
                    <div className ='container1'>
                        <img className = 'item2' src={this.state.src} />
                    </div>
                    <div className ='container2'>
                        <p className = 'item2'><strong>{this.props.item.name}</strong></p>
                        <br/>
                        <p className = 'item2'><strong>QTY:</strong> {this.props.item.value}</p>
                    </div>
                    <div className ='container3'>
                        <br/>
                        <p className = 'item2'><strong>Reason:</strong> {this.props.item.reason}</p>
                    </div>
                    <br/>
                </div>
            );
        }
        else if (this.props.step == 4){
            return(
                <div>
                    <p className = 'item' >{this.props.item.name} --- {this.props.item.variantid} --- {this.props.item.reason}</p>
                    <label className="dropdown">Reason for return:
                        <select value={this.state.status} onChange={this.handleStatusChange}>
                        <option value="submitted">Submitted</option>
                            <option value="accepted">Accepted - Resell</option>
                            <option value="returning">Accepted - No Resell</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </label>
                </div>
            )
        }
    }
}

export default Item;
