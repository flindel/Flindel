import React, {Component} from 'react';
import './universal.css'
//import { app } from '@shopify/app-bridge/actions/Print';
/* NAVBAR to flip between map view and return portal view. Imported at the top of most pages */
class universalNavBar extends Component{
    constructor(props){
        super(props)
    }
    render(){
        if (this.props.show){
            //if we're on a middle step, show progressbar
            return(
                <div>
                    <p className = 'headerLogo'>
                    <br/>
                    <br/>
                    {/*change this logo to live generated later*/}
                    <img className = 'headerLogo' src = 'https://anya23blog.files.wordpress.com/2016/11/pomelo-logo-square.jpg?w=820&h=312&crop=1'/>
                    <br/>
                    <br/>
                    </p>
                    <br/><br/>
                    <h1 className='top'>Returns</h1>

                    <div className = 'containerPB'>  
                        <ul className="progressbar">
                            <li className = {this.props.step1} onClick = {this.props.viewPage2}><span>Select</span></li>
                            <li className = {this.props.step2} onClick = {this.props.viewPage3}><span>Review</span></li>
                            <li className = {this.props.step3}><span>Confirm</span></li>
                        </ul>
                    </div>
                    <br/><br/><br/><br/>
                </div>
            )
        }
        else{
            //if it's the first or fifth page, there's no progress bar. don't show it, just the brand logo banner
            return(
            <div>
                <p className = 'headerLogo'>
                <br/>
                <br/>
                <a href={this.props.shopDomain}>
                <img className = 'headerLogo' 
                    src = 'https://anya23blog.files.wordpress.com/2016/11/pomelo-logo-square.jpg?w=820&h=312&crop=1' />
                </a>
                <br/>
                <br/>
                </p>
                <br/><br/>
                <h1 className='top'>Returns</h1>
                <p>Please enter your order details to begin</p>
                <br/>
            </div>
            )
        }
    }
}

export default universalNavBar