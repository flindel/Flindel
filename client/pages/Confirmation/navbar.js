import React, {Component} from 'react';

/* NAVBAR to flip between map view and return portal view. Imported at the top of most pages */
class universalNavBar extends Component{
    render(){
        return(
            <div>
                <button onClick ={this.props.unviewMaps}> RETURN FORM </button>
                <button onClick ={this.props.viewMaps}> LOCATIONS </button>  
                <h1>{this.props.shopName} Return Portal</h1> 
            </div>
        )
    }
}

export default universalNavBar