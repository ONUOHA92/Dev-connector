import axios from 'axios';
import setAuthToken  from '../utils/setAuthToken'
import jwt_decode from 'jwt-decode'
import { GET_ERRORS, SET_CURRENT_USER } from './types'

//    Register user

//  dispatch is coming from redux thunk

export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// login-GET USER LOGIN TOKEN
export const loginUser = userData => dispatch => {
  axios.post('/api/users/login', userData) 
    .then(res => {
      // save to local storage
      const { token } = res.data
      //set token to localstorage
      localStorage.setItem('jwtToken', token);
      //set token to authHeader
      setAuthToken(token);
      // decode token to get userdata
      const decoded = jwt_decode(token);
      //set current user
      dispatch(setCurrentUser(decoded))
    })
    .catch(err => dispatch({
      type: GET_ERRORS,
      payload: err.response.data
    })
    );
}


// SET CURRENT USER
export const setCurrentUser = (decoded) => {
   return {
     type: SET_CURRENT_USER,
     payload: decoded
   }
}



// SET LOGOUT USER
 export const logoutUser = () => dispatch => {
  //  remove item from local storsge
  localStorage.removeItem('jwtToken');

  // remove Auth header for future request
    setAuthToken(false )
    // set current user {} with the isAuthenticated to false
    dispatch(setCurrentUser({}))
 }