import React, { Component } from 'react';

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
                        <div className="Seach-block">
                            <label>Order Number:</label>
                              <input type="text" className="order-number" placeholder="1234567" onChange={this.handleOrderNumChange} />
                          </div>
                          <div className="Search-block">
                              <label>Email Address or Phone number:</label>
                              <input type="text" className="email-add" placeholder="Sarah@example.com" onChange={this.handleEmailChange} />
                          </div>
                    </div>
                       <div className="Search-submit">
                          <button type="submit" onClick={this.handleSearch}>NEXT</button>
                    </div>
                  </div>
                );
        } 
    }
    


export default Search;