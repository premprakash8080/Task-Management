import React,{Component} from 'react'
import {Link} from 'react-router-dom'
import AddUser from '../forms/addUser'

class Header extends Component{
    render(){
        return(
                <header>
                  <div className="container containerDashboard">
                    <div className="mainMenu">
                    </div>
                    {/* <div className="profilewidget">
                      <AddUser/>
                    </div> */}
                  </div>
                </header>
        )
    }
}
export default Header