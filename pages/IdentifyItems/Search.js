import React, { Component } from 'react';

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
    
    
        handleOrderNumChange(e){
            this.setState({
                orderNum: e.target.value
            });
        }
    
        handleEmailChange(e){
            this.setState({
                emailAdd: e.target.value
            });
        }
    
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
                              <label>Email Address:</label>
                              <input type="email" className="email-add" placeholder="Sarah@example.com" onChange={this.handleEmailChange} />
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