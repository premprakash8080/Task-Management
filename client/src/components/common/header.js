import React,{Component} from 'react'
import {Link} from 'react-router-dom'
import AddUser from '../forms/addUser'

class Header extends Component{
    render(){
        return(
                <header>
                  <div className="container containerDashboard">
                    <div className="mainMenu">
                      <ul>
                      <Link to="/story/1" className="active"><li><i className="fas fa-folder-open"></i><span className="mainMenuText">Projects</span></li></Link>
                      <Link to="/about" className="active"><li><i className="fas fa-thumbs-up"/><span className="mainMenuText">About</span></li></Link>
                      <a rel="noopener noreferrer" target="_blank" href="https://github.com/mreorhan/Scrum-Task-Management-with-ReactJS-Express-Server"><li><i className="fas fa-code-branch"/><span className="mainMenuText">Fork Me on Github</span></li></a>
                      </ul>
                    </div>
                    <div className="profilewidget">
                      <AddUser/>
                    </div>
                  </div>
                </header>
        )
    }
}
export default Header