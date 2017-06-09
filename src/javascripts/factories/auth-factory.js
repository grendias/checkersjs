'use strict';
app.factory('AuthFactory', ($location, $timeout, $cookies) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      firebase.database().ref(`/users/${user.uid}`).set({
        email: user.email,
      });
      $cookies.put('userid', user.uid);
      $cookies.put('email', user.email);
      $location.path(`/dashboard/${user.uid}`);
      $timeout();
    } else {
      $location.path('/');
      $timeout();
    }
  });
  return {
    login(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password);
      },
      logout() {
        firebase.auth().signOut();
      },
      register(email, password) {
        firebase.auth().createUserWithEmailAndPassword(email, password);
      }
  };
});
app.factory('UsersFact', () => {
  const currentUser = firebase.auth().currentUser;
  return {
    user: currentUser
  };
});
