import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import ClientDetails from './components/ClientDetails';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={ClientList} />
        <Route path="/clients/new" component={ClientForm} />
        <Route path="/clients/:id" component={ClientDetails} />
      </Switch>
    </Router>
  );
};

export default App;