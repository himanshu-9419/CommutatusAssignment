import React,{ Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import ViewOpportunities from "./containers/opportunities/viewOpportunities/viewOpportunities";
import EditOpportunities from "./containers/opportunities/editOpportunities/editOpportunities";
class App extends Component {
  render() {
    return (
      <Switch>
        <Route path="/" exact component={ViewOpportunities}/>
        <Route path="/:id" exact component={EditOpportunities} />
      </Switch>
    );
  }
}

export default App;
