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

// Initialize Firebase
firebaseConfig.initializeApp(firebaseConfig);
const database = firebaseConfig.database();

//DOM element
const movieForm = document.getElementById('movieForm');
const movieIdInput = document.getElementById('movieId');
const titleInput = document.getElementById('title');
const yearInput = document.getElementById('year');
const derectorInput = document.getElementById('director');
const genreSelect = document.getElementById('genre');
const statusRadios = document.getElementById('status');
const ratingInput = document.getElementById('rating');
const notesInput = document.getElementById('notes');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const moviesList = document.getElementById('moviesList');
const totalMovies = document.getElementById('totalMovies');
const watchlistCount = document.getElementById('watchlist');
const watchedCount = document.getElementById('watchedCount');

const stars = document.querySelectorAll('.rating-stars i');

let isEditing = false;
let currentMovieId = null;

//Initialize the application
function init(){
    //setup event listeners
    movieForm.addEventListener('submit', handleFormSumbit);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', filterMovies);
    filterStatus.addEventListener('change', filterMovies);
}

function loadMovies(){}

function displayMovies(movies){}

function handleFormSumbit(e){}

function handleEditMovie(e){}

function handleDeleteMovie(e){}

function filterMovies(){}

function resetForm(){}

//Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

