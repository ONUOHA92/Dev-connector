import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import setAuthtoken from './utils/setAuthToken'
import { setCurrentUser, logoutUser } from './actions/authActions';
import { clearCurrentProfile } from './actions/profileActions';
import { Provider } from 'react-redux'
import store from './store'

//this is to import private Route
import PrivateRoute from './components/common/PrivateRoute'



import Navbar from './components/Layouts/Navbar'
import Footer from './components/Layouts/Footer'
import Landing from './components/Layouts/Landing'
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import Dashboard from './components/dashboard/Dashboard'
import CreateProfile from './components/create-profile/CreateProfile'
import EditProfile from './components/edit-profile/EditProfile'
import AddExperience from './components/add-credentials/AddExperience'

import './App.css';


// check for token
if (localStorage.jwtToken) {
  //set auth token header auth
  setAuthtoken(localStorage.jwtToken);
  //decode token and get user info and experation
  const decoded = jwt_decode(localStorage.jwtToken);
  //set user is Authenticated
  store.dispatch(setCurrentUser(decoded));

  //check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // logout user
    store.dispatch(logoutUser());
    //  clear the current profile
    store.dispatch(clearCurrentProfile());
    // redirect to the login page
    window.location.href = '/login';

  }

}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <Route exact path="/" component={Landing} /> 
          <div className="container">
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />

            <Switch>
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
            </Switch>

            <Switch>
              <PrivateRoute exact path="/create-profile" component={CreateProfile} />
            </Switch>
            
            <Switch>
              <PrivateRoute exact path="/edit-profile" component={EditProfile} />
            </Switch>
            
            <Switch>
              <PrivateRoute exact path="/add-experience" component={AddExperience} />
            </Switch>

          </div>
          <Footer />
        </div>
      </Router>
    </Provider>

  );
}

export default App;
