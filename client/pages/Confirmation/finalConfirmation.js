import React from 'react';
import Item from "./Item2";

/* PRICING PAGE
Shows the customer the financial information for their return
*/

class finalPage extends React.Component{
    //display
    render(){
    return(
        <div>
            <div className = 'itemList'>
                <fieldset className = 'page2'>
                    <p className = 'orderHeader'>Order Number: {this.props.orderNum}</p>
                    {this.props.items.map((item,index)=>{
                        return <Item item={item} serveoname={this.props.serveoname} step = {3} key={index}/>    
                    })}
                </fieldset>
            </div>
            <br/>
            <footer className = 'f1'>
                <button className = 'Submit2' onClick = {this.props.finishPricing}>SUBMIT</button>
            </footer>
        </div>
    )}
}

export default finalPage