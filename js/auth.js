import{
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    sendEmailVerification,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import {auth} from './firebase.js';

//DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const googleLoginBtn = document.getElementById('googleLogin');
const logoutBtn = document.getElementById('logoutBtn');
const authError = document.getElementById('authError');

//Login with email/password
if(loginForm){
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm['loginEmail'].value;
        const password = loginForm['loginPassword'].value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message);
        }
    })
}

//Register New User
if(registerForm){
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerForm['registerEmail'].value;
        const password = registerForm['registerPassword'].value;
        const confirmPassword = registerForm['registerConfirmPassword'].value;

        if(password !== confirmPassword){
            showAuthError('Password do not match!!');
            return;
        }

        try {
            const userCredential = 
            await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            alert('Verification email sent! Please check your inbox');
            window.location.href = 'dashboard.html';
        } catch (error) {
            showAuthError(error.message);
        }
    });
}

//Google Sign-In
if(googleLoginBtn){
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showAuthError(error.message);
        }
    });
}

//Logout
if(logoutBtn){
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            showAuthError(error.message);
            console.error("Logout Error: ",error);
        }
    })
}

//Auth state observer
onAuthStateChanged(auth, (user) => {
    if(user){
        if(window.location.pathname.includes('index.html')){
            window.location.href = 'dashboard.html';
        }
    } else{
        if(window.location.pathname.includes('dashboard.html')){
            window.location.href = 'index.html';
        }
    }
});

//show authentication error
function showAuthError(message){
    authError.textContent = message;
    authError.style.display = 'block';
    setTimeout(()=>{
        authError.style.display = 'none';
    }, 5000);
}