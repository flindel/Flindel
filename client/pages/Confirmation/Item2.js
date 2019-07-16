import React, { Component } from 'react';
import './universal.css'

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
            status: this.props.item.status

        };
        this.setState = this.setState.bind(this)
        this.handleReasonChange = this.handleReasonChange.bind(this);
        this.handleQuantityChange=this.handleQuantityChange.bind(this);
        this.handleStatusChange=this.handleStatusChange.bind(this)

    }

    //handle selecting a change in quantity
    handleQuantityChange(e){
        //use callback to pass select item since setState is asyn
        this.setState({
            value:e.target.value
        },()=>this.props.handleSelect(this.state.productid, this.state.variantid, this.state.name,
            this.state.value, this.state.src, this.state.quantity, this.state.price, this.state.reason))

    }

    //handle inputting the reason for return
    handleReasonChange(e){
        let old = this.state.reason
         this.setState({
                 reason:e.target.value
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
                <img
                className = 'item2'
                src={this.state.src} />
                {/* dropdown menu to choose return quantity */}
                <span><label className="dropdown2">Quantity for Return:
                    <select value={this.state.value} onChange={this.handleQuantityChange}>
                      {quantityOption}
                    </select>
                </label></span>
                <span><p className = 'item2'>{this.props.item.name}</p> </span>
                <br/>
            </div>
        );
        }
        else if (this.props.step == 2){
            return (
                <div>
                    <hr className = 'hl4'></hr>
                    <img
                    className = 'item3'
                    src={this.state.src} />
                    {/* dropdown menu to choose return reason */}
                    <span><label className="dropdown3">Reason for return:
                        <select value={this.state.reason} onChange={this.handleReasonChange}>
                            <option value="---">---</option>
                            <option value="Unhappy">I'm unhappy with this product.</option>
                            <option value="Broken">This product is damaged or broken.</option>
                            <option value="Wrong">Product is wrong (size, color, etc).</option>
                        </select>
                    </label></span>
                    <span><p className = 'item3'>{this.props.item.name}, QTY: {this.props.item.value}</p> </span>

                </div>
            );
        }
        else if (this.props.step == 3){
            return(
                <div>
                    <hr className = 'hl4'></hr>
                    <img  className = 'item4'
                    src={this.state.src} />
                    <p className = 'item4price'>Reason: {this.props.item.reason}</p>
                    <p className = 'item4'>{this.props.item.name}, QTY: {this.props.item.value}</p>
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
