import React from 'react';
import Item from "./Item2";

/* Final confirmation page
Allow customer to look over one more time before submit
*/

class finalPage extends React.Component{
    //display
    render(){
    return(
        <div>
            <div className = 'itemList'>
                <fieldset className = 'page2'>
                    {/* <p className = 'orderHeader'>Order Number: {this.props.orderNum}</p> */}
                    <br/>
                    {this.props.items.map((item,index)=>{
                        return <Item item={item} serveoname={this.props.serveoname} step = {3} review = {true} key={index}/>    
                    })}
                </fieldset>
            </div>
            <br/>
            {/* if review == true, do not show submit button */}
            {
                this.props.review? null:(<footer className = 'f1'>
                <button className = 'Submit2' onClick = {this.props.finishOrder}>SUBMIT</button>
            </footer>)
            }
            
        </div>
    )}
}

export default finalPage