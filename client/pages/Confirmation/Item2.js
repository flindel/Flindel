import React, { Component } from 'react';
import './universal.css'
import Select from 'react-select';

const greyStyle={
    backgroundColor: 'grey'
}

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
            flag: this.props.item.flag,
            activeReason: [],
            style: greyStyle,
            idNew:'',
            styleName:'',
            //potential reasons for return
            reasons: [
                { value: "Broken", label: "Item is broken." },
                { value: "Wrong", label: "Item is wrong." },
                { value: "Unhappy", label: "Item is unsatisfactory." },
                { value: "Multiple", label: "Multiple reasons"}
              ],
              //potential quantities - this holds single return value, stored like this because it's a different component
            activeQuantity:[],
            quantities:[],
        };
        this.setState = this.setState.bind(this)
        this.handleReasonChange = this.handleReasonChange.bind(this);
        this.handleQuantityChange=this.handleQuantityChange.bind(this);
        this.handleStatusChange=this.handleStatusChange.bind(this)
        this.handleQuantityChangeSortingCenter=this.handleQuantityChangeSortingCenter.bind(this)
        this.handleNewIDChange = this.handleNewIDChange.bind(this)
        this.makeNewProduct = this.makeNewProduct.bind(this)
        this.getItemInformation = this.getItemInformation.bind(this)
        this.handleQuantityChangeReturn = this.handleQuantityChangeReturn.bind(this)
    }

    async makeNewProduct(){
        let [pID, name] = await this.getItemInformation(this.state.idNew)
        if (pID != 0){
            let temp = await fetch(`https://${this.props.serveoname}/products/GITinformation?varID=${encodeURIComponent(this.state.idNew)}&productID=${encodeURIComponent(pID)}`, {
            method: 'get',
            })
            let tempJSON = await temp.json()
            let newItem = {
            variantid: this.state.idNew,
            reason: 'Other',
            store:this.props.item.store,
            flag: '1',
            status: this.state.status,
            name: name,
            variantidGIT: tempJSON.variant,
            productidGIT: tempJSON.product,
            productid: pID.toString()
        }
        //get GIT information
        console.log(newItem)
        this.setState({idNew:''})
        //callback to make new product
        this.props.addItem(newItem, this.props.item)
        }
        else{
            alert('THIS IS NOT A VALID VARIANT ID')
        }
    }

    handleQuantityChangeReturn(e){
        this.props.handleQuantityChange(this.props.item.index, e.target.value)
    }

    async getItemInformation(varID){
        let temp = await fetch(`https://${this.props.serveoname}/products/all`, {
            method: 'get',
            })
        let productID = '0'
        let name = 'name'
        let productsJSON = await temp.json()
        for (var i = 0;i<productsJSON.products.length;i++){
            let tempItem = productsJSON.products[i]
            for (var j=0;j<tempItem.variants.length;j++){
                let tempVar = tempItem.variants[j]
                if (tempVar.id == varID){
                    productID = tempVar.product_id
                    name = tempItem.title + ' - ' + tempVar.title
                }
            }
        }
        return [productID, name]
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

     handleNewIDChange(e){
         this.setState({idNew:e.target.value})
     }

     //change status of item (done by sorting center)
     handleStatusChange(e){
         let old = this.state.status
         this.setState({
            status:e.target.value
        },()=> this.props.handleSelect(this.props.item.variantid, this.state.status, old))
     }

     handleQuantityChangeSortingCenter(){
        this.props.handleQuantityChange(this.props.item.index,this.props.item.variantid)
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
        //this method used by sorting centre to display - first time, one order
        else if (this.props.step == 4){
            if (this.props.item.flag != '-1'){
                return(
                    <div className = "itemContainerSC">
                        <div className ='container1SC'>
                            <hr className = 'horiz'/>
                            <img className = 'item2' src = {this.state.src}/>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className ='container1SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item' > {this.props.item.name} </p>   
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container1SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>{this.props.item.variantid}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container1SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>{this.props.item.productid}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container1SC' >
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'> {this.props.item.reason}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className ='container1SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                                <select value={this.state.status} onChange={this.handleStatusChange}>
                                    <option value="submitted">Submitted</option>
                                    <option value="accepted">Accepted - Resell</option>
                                    <option value="returning">Accepted - No Resell</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container1SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <input onChange = {this.handleNewIDChange} value = {this.state.idNew}></input>
                            <button onClick = {this.makeNewProduct}>SUBMIT</button>
                        </div>
                    </div>
                )
            }
            else{
                return(
                    <div className = "itemContainerSC">
                        <div className ='container1SC'style = {this.state.style}>
                            <hr className = 'horiz'/>
                            <img className = 'item2' src = {this.state.src}/>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className ='container1SC' style = {this.state.style}>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item' > {this.props.item.name} </p>   
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container1SC' style = {this.state.style}>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>{this.props.item.variantid}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container1SC' style = {this.state.style}>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>{this.props.item.productid}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container1SC' style = {this.state.style}>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'> {this.props.item.reason}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className ='container1SC' style = {this.state.style} >
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <select value={this.state.status} onChange={this.handleStatusChange}>
                                    <option value="submitted">Submitted</option>
                                    <option value="accepted">Accepted - Resell</option>
                                    <option value="returning">Accepted - No Resell</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container1SC' style = {this.state.style} >
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>N/A</p>
                        </div>
                    </div>
                )
            }
        }
        else if (this.props.step == 5){
            return(
                <div className = "itemContainerSC">
                        <div className ='container2SC'>
                            <hr className = 'horiz'/>
                            <img className = 'item2' src = {this.state.src}/>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className ='container2SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item' > {this.props.item.store}  </p>   
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container2SC'>
                            <hr className = 'horiz'/>
                            <br/>
                            <p className = 'item'>{this.props.item.name}</p>
                            <br/>
                            <p className = 'item'>({this.props.item.status})</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container2SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>{this.props.item.variantid}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container2SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>{this.props.item.productid}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'container2SC'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <button onClick = {this.handleQuantityChangeSortingCenter}>{this.props.item.value}</button>
                        </div>
                    </div>
                )
            }
            else if (this.props.step == 6){
                return(
                    <div className = 'itemContainerSC'>
                        <div className ='containerReturn'>
                            <hr className = 'horiz'/>
                            <img className = 'item2' src = {this.state.src}/>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className ='containerReturn'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item' > {this.props.item.name}  </p>   
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'containerReturn'>
                            <hr className = 'horiz'/>
                            <br/>
                            <br/>
                            <p className = 'item'>{this.props.item.productID}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'containerReturn'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>{this.props.item.variantid}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'containerReturn'>
                            <hr className = 'horiz'/>
                            <br/>
                            <p className = 'item'>Current: {this.props.item.quantity}</p>
                            <br/>
                            <p className = 'item'>To Return:
                            <input className = 'numInput' value = {this.props.item.value} onChange = {this.handleQuantityChangeReturn}></input>
                            </p>
                        </div>
                    </div>
                )
            }
            else if (this.props.step == 7){
                return(
                    <div className = 'itemContainerSC'>
                        <div className ='containerReturn'>
                            <hr className = 'horiz'/>
                            <img className = 'item2' src = {this.state.src}/>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className ='containerReturn'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item' > {this.props.item.name}  </p>   
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'containerReturn'>
                            <hr className = 'horiz'/>
                            <br/>
                            <br/>
                            <p className = 'item'>{this.props.item.productID}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'containerReturn'>
                            <hr className = 'horiz'/>
                            <br/><br/>
                            <p className = 'item'>{this.props.item.variantid}</p>
                        </div>
                        <div className = 'vert'>
                            <hr className = 'vert'/>
                        </div>
                        <div className = 'containerReturn'>
                            <hr className = 'horiz'/>
                            <br/>
                            <br/>
                            <p className = 'item'>{this.props.item.value}</p>
                        </div>
                    </div>
                )
            }
    }
}

export default Item;
