import React from 'react';
import Item from "./Item2";

/* PRICING PAGE
Shows the customer the financial information for their return
*/

class finalPage extends React.Component{
    constructor(props){
        super(props);
        this.state={
            rawCost:0,
            taxCost:0,
            totalCost:0

        }
        this.calculateCosts()
    }

    //calculate item costs and adding tax for final
    calculateCosts(){
        var temp = 0
        var tax = 0
        for(var i = 0; i<this.props.items.length;i++){
            temp+=parseInt(this.props.items[i].price,10)
        }
        //ensure two decimals for everything
        tax = (temp*0.13).toFixed(2)
        this.state.rawCost = temp.toFixed(2)
        this.state.taxCost = tax
        this.state.totalCost = (parseFloat(temp)+parseFloat(tax)).toFixed(2)
    }

    
    //display
    render(){
    return(
        <div>
            <h2>Pricing Confirmation</h2>
             {this.props.items.map((item)=>{
                    return <Item item={item} step = {3} key={item.variantID}/>
                })}
            <p>-----------------------------------------------------------------------------------------------</p>
            <p>Total: ${this.state.rawCost}</p>
            <p>Tax (13%): ${this.state.taxCost}</p>
            <p>-----------------------------------------------------------------------------------------------</p>
            <p>Your refund: ${this.state.totalCost}</p>
            <button onClick = {this.props.pricingBack}>Back</button>
            <button onClick = {this.props.finishPricing}>Confirm</button>
        </div>
    )}
}

export default finalPage