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
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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
const filterGenre = document.getElementById('filterGenre');
const moviesList = document.getElementById('moviesList');
const totalMovies = document.getElementById('totalMovies');
const watchlistCount = document.getElementById('watchlistCount');
const watchedCount = document.getElementById('watchedCount');

const stars = document.querySelectorAll('.rating-stars i');

let isEditing = false;
let currentMovieId = null;

//Initialize the application
function init() {
    //setup event listeners
    movieForm.addEventListener('submit', handleFormSumbit);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', filterMovies);
    filterStatus.addEventListener('change', filterMovies);

    //star functionality
    stars.forEach(star => {
        star.addEventListener('click', handleStarClick);
        star.addEventListener('mouseover', handleStarHover);
        star.addEventListener('mouseout', handleStarOut);
    });

    //load movies from firebase
    loadMovies();
}

function loadMovies() {
    //Load movies from firebase
    database.ref('movies').on('value', (snapshot) => {
        const movies = [];
        let watchlist = 0;
        let watched = 0;

        snapshot.forEach((childSnapshot) => {
            const movie = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };
            movies.push(movie);

            if (movie.status === 'watchlist') {
                watchlist++;
            } else if (movie.status === 'watched') {
                watched++;
            }
        });

        //update stats
        totalMovies.textContent = movies.length;
        watchlistCount.textContent = watchlist;
        watchedCount.textContent = watched;

        displayMovies(movies);
    })
}

//  Display movies in the UI
function displayMovies(movies) {
    if (movies.length === 0) {
        moviesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <h3>No Movies Found</h3>
                <p>Add your first movie to get started!!</p>
            </div>
        `;
        return;
    }

    moviesList.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.id = movie.id;

        //create star rating HTML
        let starHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= movie.rating) {
                starHtml += '<i class="fas fa-star"></i>';
            } else {
                starHtml += '<i class="far fa-star"></i>';
            }
        }

        movieCard.innerHTML = `
            <div class="movie-poster" style="background-image: url('${movie.posterUrl
            || '../images/movie-placeholder.jpg'}')">
                <span class="movie-status ${movie.status}">
                    ${movie.status === 'watchlist' ? 'To Watch' : 'Watched'}
                </span>
            </div>

            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.year}</span>
                    <span>${movie.genre}</span>
                </div>
                <div class="movie-rating">
                    ${starHtml}
                </div>
                ${movie.notes ? `<p class="movie-notes">${movie.notes}</p>` : ``}
                <div class="movie-actions">
                    <button class="btn btn-edit" data-id="${movie.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" data-id="${movie.id}">
                        <i class="fas fa-trash"></i>Delete
                    </button>
                </div>
            </div>
        `;
        moviesList.appendChild(movieCard);
    });

    //add event listeners to update and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', handleEditMovie);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteMovie);
    });
}

function handleFormSumbit(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const year = yearInput.value;
    const director = derectorInput.value.trim();
    const genre = genreSelect.value;
    const status = document.querySelector('input[name="status"]:checked').value;
    const rating = ratingInput.value;
    const notes = notesInput.value.trim();

    if (!title) {
        alert('Please enter a movie title');
        return;
    }

    const movieData = {
        title,
        year: year || null,
        director: director || null,
        genre,
        status,
        rating: rating ? parseInt(rating) : 0,
        notes: notes || null,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    }

    if (isEditing) {
        //update existing movie
        database.ref(`movies/${currentMovieId}`).update(movieData)
        .then(() => {
            showAlert('Movie updated successfully!!', 'success');
            resetForm();
        })
        .catch(error => {
            showAlert('error updating movie:'+ error.message, 'error');
        });

    } else {
        //add new movie
        database.ref('movies').push(movieData)
            .then(() => {
                showAlert('Movie added successfully!', 'success');
                resetForm();
            })
            .catch(error => {
                showAlert('Error adding movie: ' + error.message, 'error');
            });
    }
}

function handleEditMovie(e) { 
    const movieId = e.currentTarget.dataset.id;

    database.ref(`movies/${movieId}`).once('value')
    .then(snapshot => {
        const movie = snapshot.val();

        //fill the form with movie data
        movieIdInput.value = movieId;
        titleInput.value = movie.title || '';
        yearInput.value = movie.year || '';
        derectorInput.value = movie.director || '';
        genreSelect.value = movie.genre || 'Action';
        
        document.querySelector(`input[name="status"][value="${movie.status}"]`).checked = true;

        ratingInput.value = movie.rating || 0;
        updateStarRating(movie.rating || 0);

        notesInput.value = movie.notes || '';

        isEditing = true;
        currentMovieId = movieId;
        saveBtn.textContent = 'Update Movie';

        //scroll to form
        document.querySelector('.form-container').scrollIntoView({behavior: "smooth"});
    })
    .catch(error => {
        showAlert('error loading movie:'+ error.message, 'error');
    })
}

function handleDeleteMovie(e) {
    if(!confirm('Are you sure want to delete this movie?')){
        return;
    }

    const movieId = e.currentTarget.dataset.id;

    database.ref(`movies/${movieId}`).remove()
    .then(() => {
        showAlert('Movie deleted successfully!!','success');
    })
    .catch(error => {
        showAlert('Error deleting movie:'+ error.message, 'error');
    });
 }

function filterMovies() { 
    const searchTerm = searchInput.value.toLowerCase();
    const stateFilter = filterStatus.value;
    const genreFilter = filterGenre.value;

    database.ref('movies').once('value')
    .then(snapshot => {
        const movies = [];
        snapshot.forEach(childSnapshot => {
            const movie = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };

            //apply filters
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm) ||
            (movie.director && movie.director.toLowerCase().includes(searchTerm));

            const matchesStatus = stateFilter === 'all' || movie.status === stateFilter;
            const matchesGenre = !genreFilter || movie.genre === genreFilter;

            if(matchesSearch && matchesStatus && matchesGenre){
                movies.push(movie);
            }
        });
        displayMovies(movies);
    });
}

function resetForm() {
    movieForm.reset();
    movieIdInput.value = '';
    ratingInput.value = '0';
    isEditing = false;
    currentMovieId = null;
    saveBtn.textContent = 'Save Movie';
}

//star rating functinalities
function handleStarClick(e) {
    const rating = parseInt(e.target.dataset.rating);
    ratingInput.value = rating;
    updateStarRating(rating);
}

function handleStarHover(e) {
    const rating = parseInt(e.target.dataset.rating);
    highlightStars(rating);
}

function handleStarOut() {
    const currentRating = parseInt(ratingInput.value);
    highlightStars(currentRating);
}

function highlightStars(count) {
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function updateStarRating(rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('active');
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

function showAlert(message, type) {
    alert(`${type.toUpperCase()}: ${message}`);
}

//Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

