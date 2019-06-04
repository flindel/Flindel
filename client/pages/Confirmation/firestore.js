import firebase from 'firebase';
import 'firebase/firestore'

const config = {
  apiKey: "AIzaSyD9PtaA5d_io3fS_b6Meb_PajZjLlG7Cgw",
  authDomain: "test-project-e43b5.firebaseapp.com",
  databaseURL: "https://test-project-e43b5.firebaseio.com",
  projectId: "test-project-e43b5",
  storageBucket: "test-project-e43b5.appspot.com",
  messagingSenderId: "861847910386",
  appId: "1:861847910386:web:d98dd198ef4db8fb"
};
if (!firebase.apps.length){
  firebase.initializeApp(config);
}

export default firebase;