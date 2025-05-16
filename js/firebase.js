import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

// Firebase Configurations
const firebaseConfig = {
    apiKey: "AIzaSyDso02eaYtGJ3GX4gF43shQohUkbRbVIio",
    authDomain: "movie-wishlist-82bf5.firebaseapp.com",
    databaseURL: "https://movie-wishlist-82bf5-default-rtdb.firebaseio.com",
    projectId: "movie-wishlist-82bf5",
    storageBucket: "movie-wishlist-82bf5.firebasestorage.app",
    messagingSenderId: "319116680069",
    appId: "1:319116680069:web:b102a0da70b514037802ec",
    measurementId: "G-J46C194YDY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export {auth, database};