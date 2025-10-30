import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <h1>Customer Management</h1>
        <Switch>
          <Route path="/" exact component={CustomerList} />
          <Route path="/add" component={CustomerForm} />
          <Route path="/edit/:id" component={CustomerForm} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;