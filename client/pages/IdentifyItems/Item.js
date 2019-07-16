import React, { Component } from 'react';

const imgStyle={
    height:188
};

class Item extends Component {
    constructor(props){
        super(props) ;
        this.state = {
            productid: this.props.item.productID,
            variantid: this.props.item.variantID,
            name: this.props.item.name,
            value: "0",  //the quantity that user wants to return
            src:"",
            quantity: this.props.item.quantity,//the quantity of a item that user total brought
            //returnReason:"---",
            //checkToReturn: false,
            //disableDrop: true

        };
        this.handleQuantityChange=this.handleQuantityChange.bind(this);
        //this.handleReasonChange=this.handleReasonChange.bind(this);
        //this.handleCheckBox=this.handleCheckBox.bind(this);

    }

    handleQuantityChange(e){
        //use callback to pass select item since setState is asyn
        this.setState({
            value:e.target.value
        },()=>this.props.handleSelect(this.state.productid, this.state.variantid, this.state.name,
            this.state.value, this.state.src, this.state.quantity))

    }




    // handleReasonChange(e){
    //     this.setState({
    //             returnReason:e.target.value
    //     })
    // }

    // handleCheckBox(e){
    //     this.setState({
    //         checkToReturn: e.target.checked
    //     })
    //     if(e.target.checked==false){
    //         this.setState({
    //             value:"0",
    //             returnReason:"---"
    //         })
    //     }
    // }

    componentWillMount(){
        //get img src

        fetch(`https://depereo.serveo.net/products?id=${encodeURIComponent(this.props.item.productID)}`, {
            method: 'GET',})
        .then(response => response.json())
        .then(resData=>{
            //console.log("img resData="+JSON.stringify(resData));
        if(resData.product){
            this.setState({
                    src: resData.product.image.src
            })

            }
        });

    }


    render() {
        //get totally quantity from state and pass it to return quantity choose dropdown menu
        let quantityArr = [];
            for(let i=0; i<=this.state.quantity; i++){
                quantityArr.push(i);
            };
        let quantityOption = quantityArr.map((quantity, index)=>{
            return <option value={quantity} key={index}>{quantity}</option>
        })

        return (
            <div>

                <img
                style={imgStyle}
                src={this.state.src} />

                <p>{this.props.item.name}</p>


                {/* dropdown menu to choose return quantity */}
                <label className="dropdown">choose quantity:
                    <select value={this.state.value} onChange={this.handleQuantityChange}>
                      {quantityOption}
                    </select>
                </label>

                {/* dropdown menu to choose return reason */}
                {/* <label className="dropdown">choose reason:
                    <select value={this.state.returnReason} disabled={!this.state.checkToReturn} onChange={this.handleReasonChange}>
                        <option disabled hidden value="---">---</option>
                        <option value="reason1">reason1</option>
                        <option value="reason2">reason2</option>
                        <option value="reason3">reason3</option>
                        <option value="reason4">reason4</option>
                    </select>
                </label> */}

                {/* <div>item state: {JSON.stringify(this.state)}</div> */}

                {/* checkbox for select item, if checked will enable user to select return reason and quantity */}
                {/* <div><input type="checkbox" checked={this.state.checkToReturn} onChange={this.handleCheckBox}/><span>return?</span></div> */}
                <p>{JSON.stringify(this.state)}</p>
            </div>
        );
    }
}

export default Item;
