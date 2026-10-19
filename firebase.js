
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    set,
    get
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBB6usEF1njqGpIlyWgKCCwKAT4YEBRmQ4",
    authDomain: "mandaiparking.firebaseapp.com",
    databaseURL:
        "https://mandaiparking-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mandaiparking",
    storageBucket: "mandaiparking.firebasestorage.app",
    messagingSenderId: "21748676712",
    appId: "1:21748676712:web:87ea7ddee2f414b941e3dd"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);


/* =========================================================
   EXPOSE FIREBASE FUNCTIONS
========================================================= */

window.database = database;
window.auth = auth;

window.firebaseRef = ref;
window.firebaseSet = set;
window.firebaseGet = get;

window.createUserWithEmailAndPassword =
    createUserWithEmailAndPassword;

window.signInWithEmailAndPassword =
    signInWithEmailAndPassword;


/* =========================================================
   FIREBASE LIVE DATA
========================================================= */

window.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       LIVE PARKING SLOTS
    =============================== */

    const slotsRef = ref(database, "parking/slots");

    onValue(slotsRef, (snapshot) => {

        const slots = snapshot.val() || {};

        console.log("LIVE SLOTS:", slots);

        window.firebaseSlots = slots;

        let availableCount = 0;

Object.values(slots).forEach(location => {
    Object.values(location || {}).forEach(slot => {
        const status = String(
            slot?.status || "available"
        ).toLowerCase();

        if (status === "available") {
            availableCount++;
        }
    });
});

        const availableElement =
            document.getElementById("statAvailable");

        if (availableElement) {
            availableElement.textContent = availableCount;
        }

        if (typeof refreshFirebaseSlots === "function") {
            refreshFirebaseSlots();
        }

        if (typeof updateDashboardParking === "function") {
            updateDashboardParking(slots);
        }

    });


    /* ===============================
       CURRENT USER
    =============================== */

    onAuthStateChanged(auth, (user) => {

        window.currentUser = user || null;

        if (!user) {
            console.log("No Firebase user logged in.");
            window.firebaseUserReservations = {};
            window.firebaseUserSpent = 0;
            window.activeReservation = null;
            return;
        }

        console.log("Logged in user:", user.uid);


        /* ===============================
           USER RESERVATIONS
        =============================== */

        const userReservationsRef = ref(
            database,
            "users/" + user.uid + "/reservations"
        );

        onValue(userReservationsRef, (snapshot) => {

            const reservations = snapshot.val() || {};

            window.firebaseUserReservations = reservations;

            const reservationCount =
                Object.keys(reservations).length;

            const statRes =
                document.getElementById("statRes");

            if (statRes) {
                statRes.textContent = reservationCount;
            }

        });


        /* ===============================
           USER SPENDING
        =============================== */

        const userSpentRef = ref(
            database,
            "users/" + user.uid + "/spent"
        );

        onValue(userSpentRef, (snapshot) => {

            const spent = Number(snapshot.val()) || 0;

            window.firebaseUserSpent = spent;

            const statSpent =
                document.getElementById("statSpent");

            if (statSpent) {
                statSpent.textContent = Math.round(spent);
            }

        });


        /* ===============================
           ACTIVE RESERVATION
        =============================== */

        const activeReservationRef = ref(
            database,
            "users/" + user.uid + "/activeReservation"
        );

        onValue(activeReservationRef, (snapshot) => {

            window.activeReservation = snapshot.val();

            console.log(
                "ACTIVE RESERVATION:",
                window.activeReservation
            );

        });

    });

});