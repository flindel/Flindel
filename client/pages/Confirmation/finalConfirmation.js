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
    }

    //calculate item costs and adding tax for final
    componentDidMount(){
        let temp = 0
        let tax = 0
        for(var i = 0; i<this.props.items.length;i++){
            temp+=parseInt(this.props.items[i].price,10)
        }
        //ensure two decimals for everything
        tax = (temp*0.13).toFixed(2)
        this.setState({
            rawCost: temp.toFixed(2),
            taxCost: tax,
            totalCost: (parseFloat(temp)+parseFloat(tax)).toFixed(2)
        })
        
    }

    
    //display
    render(){
    return(
        <div>
            <h3 className = 'pageTitle4'>Final Confirmation</h3>
            <fieldset className = 'page4'>
            <p className = 'orderHeader'>Order Number: {this.props.orderNum}</p>
             {this.props.items.map((item,index)=>{
                    return <Item item={item} serveoname={this.props.serveoname} step = {3} key={index}/>
                    
                })}
            </fieldset>
            <br/>
            <button className = 'Submit2' onClick = {this.props.finishPricing}>SUBMIT</button>
        </div>
    )}
}

export default finalPage