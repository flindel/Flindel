import React, { Component } from 'react';
import './universal.css'

/* SEARCH PAGE
First page customers sees, prompts them to input order num+other identifier
*/

class Search extends Component {
        constructor(props) {
            super(props);
            this.state = {
                emailAdd: '',
                orderNum: '',   
            };
            this.handleEmailChange = this.handleEmailChange.bind(this);
            this.handleOrderNumChange = this.handleOrderNumChange.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
        }
        
    
        //handle input of info
        handleOrderNumChange(e){
            this.setState({
                orderNum: e.target.value
            });
        }
    
        //handle input of info
        handleEmailChange(e){
            this.setState({
                emailAdd: e.target.value
            });
        }
    
        //handle submit
        handleSearch(e){
            this.props.identifyItems(this.state.orderNum, this.state.emailAdd);
            //event.preventDefault();
        }
    
        render() {
            return (
                <div className="Search">
                    <div className="Search-fields">
                        <fieldset className = 'page1'>
                        <div className="Search-block">
                        <p className = 'label'>Order Number:  </p>
                              <input type="text" className="order-number" placeholder="1234" onChange={this.handleOrderNumChange} />
                          </div>
                          <br></br>
                          <div className="Search-block">
                              <p className = 'label'>Email Address or Phone Number:  </p>
                              <input type="text" className="email-add" placeholder="your.email@example.com" onChange={this.handleEmailChange} />
                          </div>
                          
                          <br/><br/>
                          <div className="Search-submit">
                          <button className = "Submit" type="submit" onClick={this.handleSearch}>CONTINUE</button>
                    </div>
                    </fieldset> 
                    </div>                
                  </div>
                );
        } 
    }
    


export default Search;