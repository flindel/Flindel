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
                style:'Blackout1'
            };
            this.handleEmailChange = this.handleEmailChange.bind(this);
            this.handleOrderNumChange = this.handleOrderNumChange.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.checkButton=this.checkButton.bind(this)
        }
        
    
        //handle input of info
        handleOrderNumChange(e){
            this.setState({
                orderNum: e.target.value
            });
            this.checkButton()
        }
    
        //handle input of info
        handleEmailChange(e){
            this.setState({
                emailAdd: e.target.value
            });
            this.checkButton()
        }

        checkButton(){
            alert
            if (this.state.emailAdd !='' && this.state.orderNum!=''){
                this.setState({style:'Submit1'})
            }
            else{
                this.setState({style:'Blackout1'})
            }
        }
    
        //handle submit
        handleSearch(e){
            this.props.identifyItems(this.state.orderNum, this.state.emailAdd, true);//true means function will call Database check if this return exist
            //event.preventDefault();
        }
    
        render() {
            return (
                <div className="Search">
                    <div className="Search-fields">
                        <fieldset className = 'page1'>
                        <div className="Search-block">
                        <p className = 'label'>Order Number: </p>
                              <input type="text" className="p1" placeholder="1234" onChange={this.handleOrderNumChange} />
                          </div>
                          <br></br>
                          <div className="Search-block">
                              <p className = 'label'>Email Address or Phone Number:  </p>
                              <input type="text" className="p1" placeholder="youremail@example.com" onChange={this.handleEmailChange} />
                          </div>
                          
                          <br/>
                          <div className="Search-submit">
                          <button className = {this.state.style} type="submit" onClick={this.handleSearch}>BEGIN</button>
                    </div>
                    </fieldset> 
                    </div>                
                  </div>
                );
        } 
    }
    


export default Search;