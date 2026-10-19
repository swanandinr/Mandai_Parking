const KEY = 'mandaiParkData';

let data = JSON.parse(
    localStorage.getItem(KEY) ||
    '{"reservations":[],"history":[],"payments":[],"timerStart":null,"spent":240,"user":"Swanandi"}'
);

let loginType = 'user';
let selectedLot = '';
let selectedRate = 20;
let selectedSlot = '';
let timerInt = null;
let selectedDestination = 'mandai';
let parkingMap = null;

window.activeReservation =
    window.activeReservation || null;

window.selectedLotKey =
    window.selectedLotKey || '';

window.pendingReservation =
    window.pendingReservation || null;

const destinations = {

    mandai: {
        name: 'Mandai Central Parking',
        lat: 18.5148,
        lng: 73.8575
    },

    market: {
        name: 'Market East Parking',
        lat: 18.5169,
        lng: 73.8589
    },

    budhwar: {
        name: 'Budhwar Road Parking',
        lat: 18.5177,
        lng: 73.8547
    },

    sarasbaug: {
        name: 'Sarasbaug Parking',
        lat: 18.5016,
        lng: 73.8495
    },

    swargate: {
        name: 'Swargate Parking',
        lat: 18.5010,
        lng: 73.8636
    },

    shaniwar: {
        name: 'Shaniwar Wada Parking',
        lat: 18.5195,
        lng: 73.8553
    }

};


/* =========================================================
   LOCAL SAVE
========================================================= */

function save() {

    localStorage.setItem(
        KEY,
        JSON.stringify(data)
    );

    updateStats();

    if (typeof renderHistory === "function") {
        renderHistory();
    }

    if (typeof renderAdminSlots === "function") {
        renderAdminSlots();
    }

}



/* =========================================================
   TOAST
========================================================= */

function toast(msg) {

    const t =
        document.getElementById('toast');

    if (!t) return;

    t.textContent = msg;

    t.classList.add('show');

    clearTimeout(window.tt);

    window.tt =
        setTimeout(() => {

            t.classList.remove('show');

        }, 2600);

}


/* =========================================================
   LOGIN TYPE
========================================================= */

function setLogin(type) {

    loginType = type;

    document
        .getElementById('userTab')
        .classList
        .toggle(
            'active',
            type === 'user'
        );

    document
        .getElementById('adminTab')
        .classList
        .toggle(
            'active',
            type === 'admin'
        );

    document.getElementById(
        'authTitle'
    ).textContent =
        type === 'admin'
            ? 'PMC Admin Portal'
            : 'Welcome back';

    document.getElementById(
        'authSub'
    ).textContent =
        type === 'admin'
            ? 'Manage Mandai parking operations.'
            : 'Smart parking for a smoother Mandai visit.';

    document.getElementById(
        'demoText'
    ).textContent =
        type === 'admin'
            ? 'admin / pmc123'
            : 'user / 1234';

}


/* =========================================================
   LOGIN
========================================================= */

async function login() {

    const username =
        document
            .getElementById("username")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value
            .trim();

    const email =
        username + "@mandaipark.com";

    try {

        await window.signInWithEmailAndPassword(
            window.auth,
            email,
            password
        );

        document
            .getElementById("auth")
            .classList
            .add("hidden");

        document
            .getElementById("app")
            .classList
            .remove("hidden");

        document
            .getElementById("who")
            .textContent =
            username;

        showPage("dashboard");

        toast(
            "Welcome to MandaiPark ✨"
        );

    }

    catch (error) {

        console.error(error);

        toast(
            "Incorrect username or password."
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    document
        .getElementById('app')
        .classList
        .add('hidden');

    document
        .getElementById('auth')
        .classList
        .remove('hidden');

    document
        .getElementById('username')
        .value = '';

    document
        .getElementById('password')
        .value = '';

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(id, btn) {

    document
        .querySelectorAll('.page')
        .forEach(
            x =>
                x.classList.add('hidden')
        );

    const page =
        document.getElementById(id);

    if (page) {

        page.classList.remove('hidden');

    }

    
if (id === "history") {
    renderHistory();
}


    /* =====================================================
       NAVIGATION MAP
    ===================================================== */

    
    if (id === 'navigate') {
        setTimeout(() => {
            loadMap();
        }, 300);
    }

    /* =====================================================
       DASHBOARD MAP
    ===================================================== */

    if (id === 'dashboard') {

        setTimeout(
            loadDashboardMap,
            100
        );

    }


    /* =====================================================
       FIND PARKING MAP
    ===================================================== */

    if (id === 'parking') {

        setTimeout(
            loadParkingMap,
            100
        );

    }


    /* =====================================================
       RESERVATION PAGE
    ===================================================== */

    if (id === 'reserve') {

        setTimeout(() => {

            refreshFirebaseSlots();

        }, 100);

    }


    /* =====================================================
       NAV BUTTON ACTIVE STATE
    ===================================================== */

    document
        .querySelectorAll('.nav button')
        .forEach(
            x =>
                x.classList.remove('active')
        );

    if (btn) {

        btn.classList.add('active');

    }


    const titles = {

        dashboard: 'Dashboard',

        parking: 'Find Parking',

        reserve: 'Slot Reservation',

        navigate: 'Real-time Navigation',

        timer: 'My Parking',

        vehicle: 'Vehicle Locator',

        traffic: 'Traffic Updates',

        payments: 'Digital Payments',

        history: 'Parking History',

        adminDash: 'PMC Overview',

        adminSlots: 'Slot Management',

        adminUsers: 'Users',

        adminReports: 'Reports'

    };


    const pageTitle =
        document.getElementById(
            'pageTitle'
        );

    if (pageTitle) {

        pageTitle.textContent =
            titles[id] ||
            'MandaiPark';

    }

}


/* =========================================================
   SELECT PARKING LOT
========================================================= */

function selectLot(lot, rate) {

    selectedLot = lot;

    selectedRate = rate;

    selectedSlot = '';


    const lotKeys = {

        'Mandai Central':
            'mandai',

        'Market East Parking':
            'market',

        'Sarasbaug Parking':
            'sarasbaug',

        'Swargate Parking':
            'swargate',

        'Shaniwar Wada Parking':
            'shaniwar'

    };


    window.selectedLotKey =
        lotKeys[lot] || '';


    const sumLot =
        document.getElementById(
            'sumLot'
        );

    if (sumLot) {

        sumLot.textContent =
            lot;

    }


    const sumRate =
        document.getElementById(
            'sumRate'
        );

    if (sumRate) {

        sumRate.textContent =
            '₹' + rate + '/hr';

    }


    const sumSlot =
        document.getElementById(
            'sumSlot'
        );

    if (sumSlot) {

        sumSlot.textContent =
            '—';

    }


    const sumStatus =
        document.getElementById(
            'sumStatus'
        );

    if (sumStatus) {

        sumStatus.textContent =
            'Select a slot';

    }


    const slotArea =
        document.getElementById(
            'slotArea'
        );

    if (slotArea) {

        slotArea.classList.remove(
            'hidden'
        );

    }


    refreshFirebaseSlots();

}


/* =========================================================
   LOAD FIREBASE SLOTS
========================================================= */

function refreshFirebaseSlots() {

    const slotsContainer =
        document.getElementById(
            'slots'
        );

    if (!slotsContainer) {

        console.log(
            "Slots container not found."
        );

        return;

    }


    slotsContainer.innerHTML = '';


    const lotKey =
        window.selectedLotKey;


    if (!lotKey) {

        console.log(
            "No parking lot selected."
        );

        return;

    }


    const firebaseSlots =
        window.firebaseSlots?.[lotKey] || {};


    console.log(
        "Refreshing slots:",
        lotKey,
        firebaseSlots
    );


    /* =====================================================
       CREATE A1 - A12
    ===================================================== */

    for (
        let i = 1;
        i <= 12;
        i++
    ) {

        const slotNumber =
            'A' + i;


        const firebaseSlot =
            firebaseSlots[slotNumber];


        const status =
            firebaseSlot &&
            firebaseSlot.status
                ? String(
                    firebaseSlot.status
                ).toLowerCase()
                : 'available';


        const isBooked =
            status === 'occupied' ||
            status === 'reserved';


        const button =
            document.createElement(
                'button'
            );


        button.type =
            'button';


        button.textContent =
            slotNumber;


        /* =================================================
           SLOT CLASS
        ================================================= */

        button.className =
            'slot ' +
            (
                isBooked
                    ? 'booked'
                    : 'free'
            );


        /* =================================================
           DISABLE BOOKED SLOT
        ================================================= */

        button.disabled =
            isBooked;


        /* =================================================
           BOOKED / RESERVED
        ================================================= */

        if (isBooked) {

            button.title =
                status === 'reserved'
                    ? 'Reserved'
                    : 'Occupied';

        }


        /* =================================================
           AVAILABLE SLOT
        ================================================= */

        else {

            button.onclick =
                function () {

                    document
                        .querySelectorAll(
                            '#slots .slot'
                        )
                        .forEach(
                            x =>
                                x.classList
                                    .remove(
                                        'selected'
                                    )
                        );


                    button.classList.add(
                        'selected'
                    );


                    selectedSlot =
                        slotNumber;


                    const sumSlot =
                        document.getElementById(
                            'sumSlot'
                        );

                    if (sumSlot) {

                        sumSlot.textContent =
                            selectedSlot;

                    }


                    const sumStatus =
                        document.getElementById(
                            'sumStatus'
                        );

                    if (sumStatus) {

                        sumStatus.textContent =
                            'Available';

                    }

                };

        }


        slotsContainer.appendChild(
            button
        );

    }

}


/* =========================================================
   CALCULATE RESERVATION AMOUNT
========================================================= */

function calculateReservationAmount() {

    const date =
        document
            .getElementById(
                'reserveDate'
            )
            ?.value;

    const start =
        document
            .getElementById(
                'startTime'
            )
            ?.value;

    const end =
        document
            .getElementById(
                'endTime'
            )
            ?.value;


    if (
        !date ||
        !start ||
        !end
    ) {

        return null;

    }


    const startMinutes =
        Number(
            start.split(':')[0]
        ) * 60 +
        Number(
            start.split(':')[1]
        );


    const endMinutes =
        Number(
            end.split(':')[0]
        ) * 60 +
        Number(
            end.split(':')[1]
        );


    if (
        endMinutes <=
        startMinutes
    ) {

        toast(
            'End time must be after start time.'
        );

        return null;

    }


    const durationMinutes =
        endMinutes -
        startMinutes;


    const durationHours =
        durationMinutes /
        60;


    const billableHours =
        Math.ceil(
            durationHours
        );


    const amount =
        billableHours *
        selectedRate;


    const durationElement =
        document.getElementById(
            'reserveDuration'
        );

    if (durationElement) {

        durationElement.textContent =
            durationHours.toFixed(1) +
            ' hr';

    }


    const amountElement =
        document.getElementById(
            'reserveAmount'
        );

    if (amountElement) {

        amountElement.textContent =
            '₹' +
            amount;

    }


    const sumDate =
        document.getElementById(
            'sumDate'
        );

    if (sumDate) {

        sumDate.textContent =
            date;

    }


    const sumTime =
        document.getElementById(
            'sumTime'
        );

    if (sumTime) {

        sumTime.textContent =
            start +
            ' - ' +
            end;

    }


    const sumAmount =
        document.getElementById(
            'sumAmount'
        );

    if (sumAmount) {

        sumAmount.textContent =
            '₹' +
            amount;

    }


    return {

        date:
            date,

        start:
            start,

        end:
            end,

        durationHours:
            durationHours,

        billableHours:
            billableHours,

        amount:
            amount

    };

}


/* =========================================================
   CONTINUE TO PAYMENT
========================================================= */

async function reserveSelected() {

    /* CHECK SLOT */

    if (
        !selectedLot ||
        !selectedSlot
    ) {

        return toast(
            "Please select an available slot first."
        );

    }


    /* CHECK LOGIN */

    const user =
        window.currentUser;


    if (!user) {

        return toast(
            "Please login first."
        );

    }


    /* CHECK EXISTING RESERVATION */

    if (
        window.activeReservation
    ) {

        return toast(
            "You already have an active reservation. Cancel it before reserving another slot."
        );

    }


    /* CALCULATE BOOKING */

    const booking =
        calculateReservationAmount();


    if (!booking) {

        return toast(
            "Please select date, start time and end time."
        );

    }


    /* CHECK LOT */

    if (
        !window.selectedLotKey
    ) {

        return toast(
            "Parking area is not configured."
        );

    }


    try {

        /* CHECK LIVE FIREBASE STATUS */

        const currentSlots =
            window.firebaseSlots?.[
                window.selectedLotKey
            ] || {};


        const currentSlot =
            currentSlots[
                selectedSlot
            ];


        if (
            currentSlot &&
            String(
                currentSlot.status || ''
            ).toLowerCase() !==
            'available'
        ) {

            refreshFirebaseSlots();

            return toast(
                "This slot is no longer available."
            );

        }


        /* STORE PENDING RESERVATION */

        window.pendingReservation = {

            lot:
                selectedLot,

            slot:
                selectedSlot,

            lotKey:
                window.selectedLotKey,

            date:
                booking.date,

            startTime:
                booking.start,

            endTime:
                booking.end,

            duration:
                booking.durationHours,

            billableHours:
                booking.billableHours,

            amount:
                booking.amount,

            userId:
                user.uid,

            userName:
                user.displayName ||
                user.email

        };


        /* PAYMENT AMOUNT */

        const payAmount =
            document.getElementById(
                'payAmount'
            );

        const payBtnAmount =
            document.getElementById(
                'payBtnAmount'
            );


        if (payAmount) {

            payAmount.value =
                booking.amount;

        }


        if (payBtnAmount) {

            payBtnAmount.textContent =
                booking.amount;

        }


        /* STATUS */

        const status =
            document.getElementById(
                'sumStatus'
            );

        if (status) {

            status.textContent =
                "Payment pending";

        }


        /* OPEN PAYMENT */

        showPage(
            'payments'
        );


        toast(
            "Reservation details ready. Complete payment to confirm."
        );

    }

    catch (error) {

        console.error(
            "Reservation preparation error:",
            error
        );

        toast(
            "Unable to continue to payment."
        );

    }

}


/* =========================================================
CANCEL RESERVATION — PRESERVE RECEIPT & HISTORY
========================================================= */

async function cancelReservation() {
const user = window.auth?.currentUser || window.currentUser;


if (!user) {
    return toast("Please login first.");
}

const reservation = window.activeReservation;

if (!reservation) {
    return toast("No active reservation found.");
}

if (!reservation.lotKey || !reservation.slot) {
    console.error("Invalid reservation:", reservation);
    return toast("Reservation information is incomplete.");
}

const reservationId = reservation.reservationId;

if (!reservationId) {
    return toast("Reservation ID is missing.");
}

try {
    const now = new Date().toISOString();

    // 1. Make the parking slot available again
    await window.firebaseSet(
        window.firebaseRef(
            window.database,
            `parking/slots/${reservation.lotKey}/${reservation.slot}`
        ),
        { status: "available" }
    );

    // 2. Preserve the receipt and mark it cancelled
    const receiptRef = window.firebaseRef(
        window.database,
        `users/${user.uid}/receipts/${reservationId}`
    );

    const receiptSnapshot = await window.firebaseGet(receiptRef);
    const existingReceipt = receiptSnapshot.exists()
        ? receiptSnapshot.val()
        : {};

    await window.firebaseSet(receiptRef, {
        ...existingReceipt,
        receiptId: existingReceipt.receiptId || reservationId,
        reservationId,
        transactionId:
            existingReceipt.transactionId ||
            reservation.transactionId ||
            "",
        userId: user.uid,
        parking:
            existingReceipt.parking ||
            reservation.lot ||
            "—",
        slot: existingReceipt.slot || reservation.slot,
        date: existingReceipt.date || reservation.date || "",
        startTime:
            existingReceipt.startTime ||
            reservation.startTime ||
            "",
        endTime:
            existingReceipt.endTime ||
            reservation.endTime ||
            "",
        duration:
            existingReceipt.duration ??
            reservation.duration ??
            0,
        amount:
            existingReceipt.amount ??
            reservation.amount ??
            0,
        paymentStatus:
            existingReceipt.paymentStatus || "Paid",
        status: "Cancelled",
        reservationStatus: "Cancelled",
        cancelledAt: now
    });

    // 3. Update history without deleting the record
    const historyRef = window.firebaseRef(
        window.database,
        `users/${user.uid}/history/${reservationId}`
    );

    const historySnapshot = await window.firebaseGet(historyRef);

    if (historySnapshot.exists()) {
        await window.firebaseSet(historyRef, {
            ...historySnapshot.val(),
            status: "Cancelled",
            cancelledAt: now
        });
    }

    // 4. Preserve the reservation record, marking it cancelled
    const savedReservationRef = window.firebaseRef(
        window.database,
        `users/${user.uid}/reservations/${reservationId}`
    );

    const savedReservationSnapshot =
        await window.firebaseGet(savedReservationRef);

    if (savedReservationSnapshot.exists()) {
        await window.firebaseSet(savedReservationRef, {
            ...savedReservationSnapshot.val(),
            status: "Cancelled",
            cancelledAt: now
        });
    }

    // 5. Remove the active reservation only
    await window.firebaseSet(
        window.firebaseRef(
            window.database,
            `users/${user.uid}/activeReservation`
        ),
        null
    );
    
    
    // 5A. Update Total Spent after cancellation
    const spentRef = window.firebaseRef(
        window.database,
        `users/${user.uid}/spent`
    );

    const spentSnapshot = await window.firebaseGet(spentRef);

    const currentSpent = Number(
        spentSnapshot.exists() ? spentSnapshot.val() : 0
    );

    const cancelledAmount = Number(
        existingReceipt.amount ??
        reservation.amount ??
        0
    );

    const updatedSpent = Math.max(
        0,
        currentSpent - cancelledAmount
    );

    await window.firebaseSet(spentRef, updatedSpent);

    window.firebaseUserSpent = updatedSpent;


    // 6. Update local reservation data
    data.reservations = (data.reservations || []).filter(
        item => item.reservationId !== reservationId
    );

    window.activeReservation = null;
window.pendingReservation = null;
selectedSlot = "";

// Reset parking timer
data.timerStart = null;
data.timerEnd = null;

if (timerInt) {
    clearInterval(timerInt);
    timerInt = null;
}

save();
updateTimer();

    // 7. Reset payment UI
    const latestPayment = document.getElementById("latestPayment");
    if (latestPayment) {
        latestPayment.innerHTML = `
            <div class="muted">
                Reservation cancelled. Your receipt remains in History.
            </div>`;
    }

    const payAmount = document.getElementById("payAmount");
    if (payAmount) payAmount.value = "";

    const payBtnAmount = document.getElementById("payBtnAmount");
    if (payBtnAmount) payBtnAmount.textContent = "0";

    const sumSlot = document.getElementById("sumSlot");
    if (sumSlot) sumSlot.textContent = "—";

    const sumStatus = document.getElementById("sumStatus");
    if (sumStatus) sumStatus.textContent = "Select a slot";

    // 8. Update live slot cache
    if (window.firebaseSlots?.[reservation.lotKey]) {
        window.firebaseSlots[reservation.lotKey][reservation.slot] = {
            status: "available"
        };
    }

    refreshFirebaseSlots();
    save();

    // Refresh history so Cancelled status appears immediately
    await renderHistory();

    toast("Reservation cancelled. Receipt preserved with CANCEL status. 🧡");

    console.log("Reservation cancelled; receipt preserved:", reservation);

} catch (error) {
    console.error("Cancel reservation error:", error);
    toast("Unable to complete cancellation. Please try again.");
}


}

window.cancelReservation = cancelReservation;


/* =========================================================
   PARKING COUNTDOWN TIMER
========================================================= */

function startTimer() {
    const reservation = window.activeReservation;

    if (!reservation) {
        return toast("Please book a parking slot first.");
    }

    if (data.timerEnd && data.timerEnd > Date.now()) {
        return toast("Parking timer is already running.");
    }

    // Duration is stored in hours
    const durationHours = Number(reservation.duration) || 1;

    data.timerStart = Date.now();
    data.timerEnd =
        Date.now() + durationHours * 60 * 60 * 1000;

    save();

    if (timerInt) clearInterval(timerInt);
    timerInt = setInterval(updateTimer, 1000);

    updateTimer();
    toast("Parking countdown started!");
}

function stopTimer() {
    if (!data.timerEnd) {
        return toast("No active parking timer.");
    }

    if (timerInt) {
        clearInterval(timerInt);
        timerInt = null;
    }

    data.timerStart = null;
    data.timerEnd = null;

    save();
    updateTimer();

    toast("Parking timer stopped.");
}

function formatCountdown(ms) {
    const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0")
    );
}

function updateTimer() {
    const isRunning =
        Number(data.timerEnd) > 0;

    const remaining = isRunning
        ? Math.max(0, data.timerEnd - Date.now())
        : 0;

    if (isRunning && remaining <= 0) {
        data.timerEnd = null;
        data.timerStart = null;

        if (timerInt) {
            clearInterval(timerInt);
            timerInt = null;
        }

        save();
    }

    const timerDisplay =
        document.getElementById("timerDisplay");

    if (timerDisplay) {
        timerDisplay.textContent =
            isRunning && remaining > 0
                ? formatCountdown(remaining)
                : "00:00:00";
    }

    const statTime =
        document.getElementById("statTime");

    if (statTime) {
        statTime.textContent =
            formatCountdown(remaining).slice(0, 5);
    }

    const timerStatus =
        document.getElementById("timerStatus");

    if (timerStatus) {
        timerStatus.textContent =
            isRunning && remaining > 0
                ? "Parking countdown active"
                : "Parking time expired or timer not started";
    }
}

/* =========================================================
   PAYMENT + CONFIRM RESERVATION + USER HISTORY
========================================================= */

async function makePayment() {

    const pending = window.pendingReservation;

    if (!pending) {
        return toast("No reservation is waiting for payment.");
    }

    const user = window.currentUser || window.auth?.currentUser;

    if (!user) {
        return toast("Please login first.");
    }

    const payMethod = document.getElementById("payMethod");

    const amount = Number(pending.amount);
    console.log("BOOKING AMOUNT:", amount);
    console.log("CURRENT FIREBASE SPENT:", window.firebaseUserSpent);
    console.log("PENDING RESERVATION:", pending);
    const method = payMethod?.value || "UPI";

    if (!amount || amount <= 0) {
        return toast("Invalid payment amount.");
    }

    try {

        /* =================================================
           DOUBLE CHECK FIREBASE SLOT
        ================================================= */

        const currentSlots =
            window.firebaseSlots?.[pending.lotKey] || {};

        const currentSlot = currentSlots[pending.slot];

        if (
            currentSlot &&
            String(currentSlot.status || "").toLowerCase() !== "available"
        ) {
            refreshFirebaseSlots();
            return toast("Sorry, this slot is no longer available.");
        }

        /* =================================================
           CREATE UNIQUE IDS
        ================================================= */

        const reservationId = "reservation_" + Date.now();

        const transactionId =
            "MP" + Date.now().toString().slice(-7);

        /* =================================================
           RESERVE PARKING SLOT IN FIREBASE
        ================================================= */

        const slotData = {
            status: "reserved",
            userId: user.uid,
            userName: user.displayName || user.email,
            reservationId: reservationId,
            date: pending.date,
            startTime: pending.startTime,
            endTime: pending.endTime
        };

        await window.firebaseSet(
            window.firebaseRef(
                window.database,
                "parking/slots/" +
                pending.lotKey +
                "/" +
                pending.slot
            ),
            slotData
        );

        /* =================================================
           UPDATE LOCAL SLOT CACHE
        ================================================= */

        if (!window.firebaseSlots) {
            window.firebaseSlots = {};
        }

        if (!window.firebaseSlots[pending.lotKey]) {
            window.firebaseSlots[pending.lotKey] = {};
        }

        window.firebaseSlots[pending.lotKey][pending.slot] =
            slotData;

        /* =================================================
           CREATE RESERVATION OBJECT
        ================================================= */

        const reservation = {
            reservationId: reservationId,
            date: pending.date,
            startTime: pending.startTime,
            endTime: pending.endTime,
            lot: pending.lot,
            lotKey: pending.lotKey,
            slot: pending.slot,
            duration: pending.duration,
            amount: amount,
            paymentStatus: "Paid",
            status: "Confirmed",
            transactionId: transactionId
        };

        /* =================================================
           SAVE USER RESERVATION
        ================================================= */

        await window.firebaseSet(
            window.firebaseRef(
                window.database,
                `users/${user.uid}/reservations/${reservationId}`
            ),
            reservation
        );

        /* =================================================
           SAVE ACTIVE RESERVATION
        ================================================= */

        const activeReservation = {
            ...reservation
        };

        await window.firebaseSet(
            window.firebaseRef(
                window.database,
                `users/${user.uid}/activeReservation`
            ),
            activeReservation
        );

        /* =================================================
           UPDATE USER SPENDING
        ================================================= */

        
/* UPDATE USER SPENDING */

const spentRef = window.firebaseRef(
    window.database,
    `users/${user.uid}/spent`
);

const spentSnapshot = await window.firebaseGet(spentRef);

const currentSpent = Number(
    spentSnapshot.exists() ? spentSnapshot.val() : 0
);

const updatedSpent = currentSpent + amount;

await window.firebaseSet(spentRef, updatedSpent);

window.firebaseUserSpent = updatedSpent;

console.log("PREVIOUS TOTAL SPENT:", currentSpent);
console.log("BOOKING AMOUNT ADDED:", amount);
console.log("UPDATED TOTAL SPENT:", updatedSpent);


        /* =================================================
           CREATE PAYMENT RECORD
        ================================================= */

        const payment = {
            date: new Date().toLocaleString(),
            amount: amount,
            method: method,
            id: transactionId,
            lot: pending.lot,
            slot: pending.slot,
            reservationId: reservationId,
            status: "Successful"
        };

        /* =================================================
           SAVE USER-SPECIFIC PARKING HISTORY
        ================================================= */

        const historyRecord = {
            reservationId: reservationId,
            transactionId: transactionId,
            date: pending.date || new Date().toLocaleDateString(),
            lot: pending.lot || "Parking",
            slot: pending.slot || "—",
            duration: pending.duration ?? "—",
            amount: amount,
            status: "Paid",
            startTime: pending.startTime || "",
            endTime: pending.endTime || "",
            method: method,
            paidAt: new Date().toISOString()
        };

        await window.firebaseSet(
            window.firebaseRef(
                window.database,
                `users/${user.uid}/history/${reservationId}`
            ),
            historyRecord
        );

        console.log("Parking history saved:", historyRecord);

        /* =================================================
           SAVE LOCAL APP DATA
        ================================================= */

        data.payments.push(payment);

        data.reservations.push({
            date: pending.date,
            startTime: pending.startTime,
            endTime: pending.endTime,
            lot: pending.lot,
            slot: pending.slot,
            duration: pending.duration,
            amount: "₹" + amount
        });

        data.history.unshift({
            date: pending.date,
            lot: pending.lot,
            slot: pending.slot,
            duration: pending.duration,
            amount: "₹" + amount,
            status: "Paid"
        });

        /* =================================================
           UPDATE ACTIVE RESERVATION IN APP
        ================================================= */

        window.activeReservation = activeReservation;

        data.timerStart = Date.now();
data.timerEnd =
    Date.now() +
    (Number(activeReservation.duration) || 1) *
    60 * 60 * 1000;

save();

if (timerInt) clearInterval(timerInt);
timerInt = setInterval(updateTimer, 1000);
updateTimer();
        /* =================================================
           CLEAR PENDING RESERVATION
        ================================================= */

        window.pendingReservation = null;

        /* =================================================
           PAYMENT RECEIPT
        ================================================= */

        const latestPayment =
            document.getElementById("latestPayment");

        if (latestPayment) {

            latestPayment.innerHTML = `
                <div class="row">
                    <span>Status</span>
                    <strong class="green">Payment Successful ✓</strong>
                </div>

                <div class="row">
                    <span>Transaction ID</span>
                    <strong>${transactionId}</strong>
                </div>

                <div class="row">
                    <span>Parking</span>
                    <strong>${pending.lot}</strong>
                </div>

                <div class="row">
                    <span>Slot</span>
                    <strong>${pending.slot}</strong>
                </div>

                <div class="row">
                    <span>Date</span>
                    <strong>${pending.date}</strong>
                </div>

                <div class="row">
                    <span>Time</span>
                    <strong>${pending.startTime} - ${pending.endTime}</strong>
                </div>

                <div class="row">
                    <span>Amount Paid</span>
                    <strong>₹${amount}</strong>
                </div>

                <div class="row">
                    <span>Method</span>
                    <strong>${method}</strong>
                </div>
            `;

            localStorage.setItem(
                "mandaiParkLatestPayment",
                latestPayment.innerHTML
            );
        }

        /* =================================================
           UPDATE SUMMARY
        ================================================= */

        const sumStatus = document.getElementById("sumStatus");

        if (sumStatus) {
            sumStatus.textContent = "Confirmed ✓";
        }

        /* =================================================
           SAVE LOCAL DATA + REFRESH HISTORY
        ================================================= */

        save();

        if (typeof window.renderHistory === "function") {
            await window.renderHistory();
        }

        /* =================================================
           REFRESH PARKING SLOT UI
        ================================================= */

        refreshFirebaseSlots();

        toast("Payment successful! Reservation confirmed 🎉");

        /* =================================================
           RETURN TO RESERVATION PAGE
        ================================================= */

        setTimeout(() => {
            showPage("reserve");
        }, 500);

    } catch (error) {

        console.error("Payment / reservation error:", error);

        toast(
            "Payment processing encountered an error. Check your reservation and payment status before trying again."
        );

    }
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

function updateStats() {

    const statRes =
        document.getElementById(
            'statRes'
        );


    if (statRes) {

        statRes.textContent =
            data.reservations.length +
            2;

    }


    const statSpent =
        document.getElementById(
            'statSpent'
        );


    if (statSpent) {

        statSpent.textContent =
            Math.round(
                data.spent
            );

    }


    const adminRes =
        document.getElementById(
            'adminRes'
        );


    if (adminRes) {

        adminRes.textContent =
            31 +
            data.reservations.length;

    }

}


/* =========================================================
   CHARTS
========================================================= */

function makeBars(id, vals) {

    const c =
        document.getElementById(id);

    if (!c) return;


    c.innerHTML =
        vals
            .map(
                (v) =>

                    '<div class="barWrap" title="' +
                    v +
                    ' vehicles">' +

                    '<div class="bar" style="height:' +
                    v +
                    '%"></div>' +

                    '</div>'
            )
            .join('');

}


/* =========================================================
   ADMIN SLOTS
========================================================= */

function renderAdminSlots() {

    const b =
        document.getElementById(
            'slotTable'
        );


    if (!b) return;


    b.innerHTML =

        [
            'A01',
            'A02',
            'A03',
            'A04',
            'A05',
            'A06',
            'B01',
            'B02'
        ]

            .map(
                (s, i) => {

                    let st =
                        i % 4 === 0
                            ? 'Occupied'
                            : i % 5 === 0
                                ? 'Reserved'
                                : 'Available';


                    return (

                        '<tr>' +

                        '<td>' +
                        s +
                        '</td>' +

                        '<td>' +
                        'Mandai Central' +
                        '</td>' +

                        '<td class="' +
                        (
                            st === 'Available'
                                ? 'green'
                                : st === 'Occupied'
                                    ? 'red'
                                    : 'yellow'
                        ) +
                        '">' +
                        st +
                        '</td>' +

                        '<td>₹20/hr</td>' +

                        '<td>' +

                        '<button class="secondary" onclick="toast(\'Slot ' +
                        s +
                        ' updated.\')">' +

                        'Manage' +

                        '</button>' +

                        '</td>' +

                        '</tr>'

                    );

                }
            )
            .join('');

}


function toggleRandomSlots() {

    toast(
        'Live slot status updated from simulated parking feed 🔄'
    );

    renderAdminSlots();

}


/* =========================================================
   PAYMENT INPUT
========================================================= */

const payAmount =
    document.getElementById(
        'payAmount'
    );


if (payAmount) {

    payAmount.addEventListener(
        'input',
        e => {

            const payBtnAmount =
                document.getElementById(
                    'payBtnAmount'
                );


            if (payBtnAmount) {

                payBtnAmount.textContent =
                    e.target.value ||
                    0;

            }

        }
    );

}

/* =========================================================
USER-SPECIFIC PARKING HISTORY WITH RECEIPTS
========================================================= */

async function renderHistory() {
const tbody = document.getElementById("historyBody");
const count = document.getElementById("historyCount");
const message = document.getElementById("historyMessage");


if (!tbody) return;

const user = window.auth?.currentUser || window.currentUser;

if (!user) {
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="muted">
                Please log in to view your parking history.
            </td>
        </tr>`;

    if (count) count.textContent = "0 records";
    return;
}

tbody.innerHTML = `
    <tr>
        <td colspan="7" class="muted">Loading history...</td>
    </tr>`;

try {
    const historyRef = window.firebaseRef(
        window.database,
        `users/${user.uid}/history`
    );

    const snapshot = await window.firebaseGet(historyRef);
    const historyData = snapshot.exists() ? snapshot.val() : {};

    const records = Object.entries(historyData)
        .map(([id, item]) => ({ id, ...item }))
        .sort((a, b) =>
            new Date(b.date || 0) - new Date(a.date || 0)
        );

    if (count) {
        count.textContent =
            `${records.length} record${records.length === 1 ? "" : "s"}`;
    }

    if (!records.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="muted">
                    No parking history found for your account.
                </td>
            </tr>`;

        if (message) {
            message.textContent =
                "Your completed payments will appear here.";
        }
        return;
    }

    tbody.replaceChildren();

    records.forEach(item => {
        const row = document.createElement("tr");

        const values = [
            item.date || "—",
            item.lot || "—",
            item.slot || "—",
            item.duration != null ? `${item.duration} hr` : "—",
            item.amount != null
                ? (String(item.amount).startsWith("₹")
                    ? item.amount
                    : `₹${item.amount}`)
                : "—",
            item.status || "Paid"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Receipts column
        const receiptCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.textContent = "View";
        viewButton.className = "receipt-view-btn";

        viewButton.addEventListener("click", () => {
            viewParkingReceipt(item.id);
        });

        receiptCell.appendChild(viewButton);
        row.appendChild(receiptCell);

        tbody.appendChild(row);
    });

    if (message) {
        message.textContent =
            "Showing your account's parking records.";
    }

} catch (error) {
    console.error("History loading failed:", error);

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="muted">
                Could not load history. Please try again.
            </td>
        </tr>`;

    if (count) count.textContent = "Unavailable";
    if (message) message.textContent = error.message;
}


}

window.renderHistory = renderHistory;

/* =========================================================
VIEW FULL SAVED PARKING RECEIPT
========================================================= */

async function viewParkingReceipt(reservationId) {
const user = window.auth?.currentUser || window.currentUser;


if (!user) {
    return toast("Please log in to view your receipt.");
}

try {
    const receiptRef = window.firebaseRef(
        window.database,
        `users/${user.uid}/receipts/${reservationId}`
    );

    const snapshot = await window.firebaseGet(receiptRef);

    if (!snapshot.exists()) {
        return toast(
            "Receipt not found. Please save the receipt first."
        );
    }

    const receipt = snapshot.val();

    // Show the complete saved receipt in a modal.
    let modal = document.getElementById("parkingReceiptModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "parkingReceiptModal";
        modal.innerHTML = `
            <div class="parking-receipt-overlay">
                <div class="parking-receipt-card">
                    <button type="button"
                        class="parking-receipt-close"
                        aria-label="Close receipt">&times;</button>
                    <div id="parkingReceiptContent"></div>
                </div>
            </div>`;

        document.body.appendChild(modal);

        modal.querySelector(".parking-receipt-close")
            .addEventListener("click", () => modal.remove());

        modal.querySelector(".parking-receipt-overlay")
            .addEventListener("click", event => {
                if (event.target.classList.contains(
                    "parking-receipt-overlay"
                )) {
                    modal.remove();
                }
            });
    }

    const content = modal.querySelector("#parkingReceiptContent");
    content.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "PARKING PAYMENT RECEIPT";
    content.appendChild(heading);

    const details = [
        ["Receipt ID", receipt.receiptId || reservationId],
        ["Transaction ID", receipt.transactionId || "—"],
        ["Parking Location", receipt.parking || "—"],
        ["Parking Slot", receipt.slot || "—"],
        ["Date", receipt.date || "—"],
        ["Start Time", receipt.startTime || "—"],
        ["End Time", receipt.endTime || "—"],
        ["Duration", `${receipt.duration ?? 0} hr`],
        ["Payment Method", receipt.paymentMethod || "UPI"],
        ["Payment Status", receipt.paymentStatus || "Paid"],
        ["Amount Paid", `₹${receipt.amount ?? 0}`]
    ];

    details.forEach(([label, value]) => {
        const line = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        line.append(strong, document.createTextNode(String(value)));
        content.appendChild(line);
    });

    
if (
    receipt.status === "Cancelled" ||
    receipt.reservationStatus === "Cancelled"
) {
    const stamp = document.createElement("div");
    stamp.className = "cancelled-receipt-stamp";
    stamp.setAttribute("aria-label", "CANCELLED");

    ["C", "A", "N", "C", "E", "L"].forEach((letter, index) => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.style.marginLeft = `${index * 9}px`;
        stamp.appendChild(span);
    });

    content.appendChild(stamp);

    const status = document.createElement("p");
    status.className = "receipt-cancelled-status";
    status.textContent = "RESERVATION CANCELLED";
    content.appendChild(status);
} else {
    const status = document.createElement("p");
    status.className = "receipt-success-status";
    status.textContent = "✓ Payment Successful";
    content.appendChild(status);
}


    modal.style.display = "block";

} catch (error) {
    console.error("Could not open receipt:", error);
    toast("Could not load receipt. Please try again.");
}


}

window.viewParkingReceipt = viewParkingReceipt;


/* =========================================================
   INITIAL CHARTS
========================================================= */

makeBars(
    'usageChart',
    [
        35,
        45,
        55,
        78,
        91,
        83,
        67,
        74,
        60,
        52,
        45,
        38
    ]
);


makeBars(
    'trafficChart',
    [
        30,
        42,
        65,
        82,
        71,
        55,
        45,
        61,
        74,
        58,
        40,
        34
    ]
);


makeBars(
    'adminChart',
    [
        35,
        55,
        75,
        92,
        84,
        70,
        61,
        80,
        74,
        53,
        42,
        31
    ]
);


makeBars(
    'reportChart',
    [
        42,
        56,
        68,
        79,
        90,
        82,
        72,
        67,
        55,
        49,
        39,
        33
    ]
);


renderHistory();

renderAdminSlots();

updateStats();


if (data.timerStart) {

    timerInt =
        setInterval(
            updateTimer,
            1000
        );

    updateTimer();

}


/* =========================================================
   SIGN UP
========================================================= */

async function signup() {

    const username =
        document
            .getElementById(
                "username"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "password"
            )
            .value
            .trim();


    if (
        !username ||
        !password
    ) {

        return toast(
            "Please enter a username and password."
        );

    }


    const email =
        username +
        "@mandaipark.com";


    try {

        await window.createUserWithEmailAndPassword(

            window.auth,

            email,

            password

        );


        toast(
            "Account created successfully! 🎉"
        );

    }

    catch (error) {

        console.error(error);

        toast(
            error.message
        );

    }

}


/* =========================================================
   NAVIGATION
========================================================= */


function startNavigation() {
    const destination = destinations[selectedDestination];

    if (!destination) {
        return toast("Please select a parking location first.");
    }

    const googleMapsURL =
        "https://www.google.com/maps/dir/?api=1" +
        "&destination=" + destination.lat + "," + destination.lng +
        "&travelmode=driving";

    window.open(googleMapsURL, "_blank");
}

/* =========================================================
   NAVIGATION MAP
========================================================= */

let map = null;

let destinationMarker = null;

let userMarker = null;

let userLat = null;

let userLng = null;


/* =========================================================
   BLUE DESTINATION ICON
========================================================= */

function createDestinationIcon() {

    return L.icon({

        iconUrl:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='65' viewBox='0 0 50 65'%3E%3Cpath d='M25 2C12.3 2 2 12.3 2 25c0 17.3 23 38 23 38s23-20.7 23-38C48 12.3 37.7 2 25 2z' fill='%232563eb' stroke='white' stroke-width='3'/%3E%3Ccircle cx='25' cy='25' r='14' fill='white'/%3E%3Ctext x='25' y='31' text-anchor='middle' font-family='Arial' font-size='17' font-weight='bold' fill='%232563eb'%3EP%3C/text%3E%3C/svg%3E",

        iconSize:
            [50, 65],

        iconAnchor:
            [25, 63],

        popupAnchor:
            [0, -60]

    });

}


/* =========================================================
   USER LOCATION ICON
========================================================= */

function createNavigationUserIcon() {

    return L.icon({

        iconUrl:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 42 42'%3E%3Ccircle cx='21' cy='21' r='18' fill='%232563eb' fill-opacity='.18'/%3E%3Ccircle cx='21' cy='21' r='9' fill='%232563eb' stroke='white' stroke-width='4'/%3E%3C/svg%3E",

        iconSize:
            [42, 42],

        iconAnchor:
            [21, 21]

    });

}


/* =========================================================
   LOAD NAVIGATION MAP
========================================================= */

function loadMap() {

    const mapContainer =
        document.getElementById(
            "realMap"
        );

    if (!mapContainer) {
        return;
    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet is not loaded."
        );

        return toast(
            "Map library failed to load."
        );

    }


    /*
       CREATE MAP FIRST

       We do NOT wait for GPS.
       This means the selected parking
       location can always appear.
    */

    if (!map) {

        map =
            L.map(
                "realMap"
            )
                .setView(
                    [
                        18.5148,
                        73.8575
                    ],
                    15
                );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom:
                    19,

                attribution:
                    "© OpenStreetMap contributors"

            }
        ).addTo(
            map
        );

    }


    /*
       Fix Leaflet rendering when
       page was previously hidden.
    */

    setTimeout(
        function () {

            map.invalidateSize();

        },
        200
    );


    /*
       GET USER LOCATION
    */

    if (
        navigator.geolocation
    ) {

        navigator.geolocation.getCurrentPosition(

            function (position) {

                userLat =
                    position.coords.latitude;

                userLng =
                    position.coords.longitude;


                if (userMarker) {

                    map.removeLayer(
                        userMarker
                    );

                }


                userMarker =
                    L.marker(

                        [
                            userLat,
                            userLng
                        ],

                        {
                            icon:
                                createNavigationUserIcon()
                        }

                    )
                        .addTo(map)
                        .bindPopup(
                            "You are here 📍"
                        );


            },

            function () {

                console.log(
                    "Location permission not available."
                );

            }

        );

    }


    /*
       SHOW SELECTED DESTINATION
    */

    showSelectedDestination();

}


/* =========================================================
   SHOW SELECTED DESTINATION
========================================================= */

function showSelectedDestination() {

    if (!map) {
        return;
    }


    const destination =
        destinations[
            selectedDestination
        ];


    if (!destination) {
        return;
    }


    /*
       Remove old destination marker
    */

    if (destinationMarker) {

        map.removeLayer(
            destinationMarker
        );

    }


    /*
       CREATE BLUE PARKING MARKER
    */

    destinationMarker =
        L.marker(

            [
                destination.lat,
                destination.lng
            ],

            {
                icon:
                    createDestinationIcon(),

                zIndexOffset:
                    1000
            }

        )
            .addTo(map);


    destinationMarker
        .bindPopup(
            "🅿️ " +
            destination.name
        )
        .openPopup();


    /*
       MOVE MAP TO SELECTED PARKING
    */

    map.setView(

        [
            destination.lat,
            destination.lng
        ],

        16,

        {
            animate:
                true
        }

    );

}


/* =========================================================
   SELECT DESTINATION
========================================================= */

function selectDestination(place) {

    if (
        !destinations[place]
    ) {
        return;
    }


    selectedDestination =
        place;


    /*
       Update map immediately
    */

    if (map) {

        showSelectedDestination();

    }

}




/* =========================================================
   DASHBOARD MAP
========================================================= */

var dashboardMap = null;

var dashboardUserMarker = null;

var dashboardParkingMarkers = [];


/* =========================================================
   PARKING LOCATION ICON
========================================================= */

function createParkingIcon() {

    return L.icon({

        iconUrl:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='65' viewBox='0 0 50 65'%3E%3Cpath d='M25 2C12.3 2 2 12.3 2 25c0 17.3 23 38 23 38s23-20.7 23-38C48 12.3 37.7 2 25 2z' fill='%232563eb' stroke='white' stroke-width='3'/%3E%3Ccircle cx='25' cy='25' r='14' fill='white'/%3E%3Ctext x='25' y='31' text-anchor='middle' font-family='Arial' font-size='17' font-weight='bold' fill='%232563eb'%3EP%3C/text%3E%3C/svg%3E",

        iconSize:
            [50, 65],

        iconAnchor:
            [25, 63],

        popupAnchor:
            [0, -60]

    });

}


/* =========================================================
   USER LOCATION ICON
========================================================= */

function createUserIcon() {

    return L.icon({

        iconUrl:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 42 42'%3E%3Ccircle cx='21' cy='21' r='18' fill='%232563eb' fill-opacity='.18'/%3E%3Ccircle cx='21' cy='21' r='9' fill='%232563eb' stroke='white' stroke-width='4'/%3E%3C/svg%3E",

        iconSize:
            [42, 42],

        iconAnchor:
            [21, 21],

        popupAnchor:
            [0, -20]

    });

}

function selectFindParking(place) {

    if (!destinations[place]) {

        console.error(
            "Unknown parking location:",
            place
        );

        return toast(
            "Parking location not found."
        );
    }

    selectedDestination = place;

    showPage("navigate");

    setTimeout(
        function () {

            loadMap();

            showSelectedDestination();

        },
        150
    );

    toast(
        "Navigating to " +
        destinations[place].name
    );

}

/* =========================================================
   LOAD DASHBOARD MAP
========================================================= */

function loadDashboardMap() {

    const container =
        document.getElementById(
            "dashboardMap"
        );


    if (!container) return;


    if (dashboardMap) {

        setTimeout(
            function () {

                dashboardMap.invalidateSize();

            },
            200
        );


        updateDashboardParking(
            window.firebaseSlots ||
            {}
        );


        return;

    }


    dashboardMap =
        L.map(
            "dashboardMap"
        )
            .setView(
                [
                    18.5138,
                    73.8553
                ],
                15
            );


    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:
                19,

            attribution:
                "© OpenStreetMap contributors"

        }

    ).addTo(
        dashboardMap
    );


    if (
        navigator.geolocation
    ) {

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;


                dashboardUserMarker =
                    L.marker(

                        [
                            lat,
                            lng
                        ],

                        {

                            icon:
                                createUserIcon(),

                            zIndexOffset:
                                1000

                        }

                    )
                        .addTo(
                            dashboardMap
                        )
                        .bindPopup(
                            "<b>You are here 📍</b>"
                        );

            },


            function () {

                console.log(
                    "User location unavailable."
                );

            }

        );

    }


    updateDashboardParking(
        window.firebaseSlots ||
        {}
    );

}


/* =========================================================
   UPDATE PARKING MARKERS
========================================================= */

function updateDashboardParking(slots) {
    if (!dashboardMap) return;

    if (!Array.isArray(dashboardParkingMarkers)) {
        dashboardParkingMarkers = [];
    }

    dashboardParkingMarkers.forEach(marker => {
        dashboardMap.removeLayer(marker);
    });

    dashboardParkingMarkers = [];

    // Keep the rest of your existing function below this point.


    dashboardParkingMarkers = [];


    const parkingLocations = [

        {

            name:
                "Mandai Central Parking",

            lat:
                18.5138,

            lng:
                73.8553,

            lotKey:
                "mandai"

        },

        {

            name:
                "Market East Parking",

            lat:
                18.5162,

            lng:
                73.8612,

            lotKey:
                "market"

        },

        {

            name:
                "Budhwar Road Parking",

            lat:
                18.5154,

            lng:
                73.8585,

            lotKey:
                "budhwar"

        }

    ];


    parkingLocations.forEach(

        function (parking) {

            let available =
                0;

            let total =
                0;


            const currentSlots =
                slots &&
                slots[
                    parking.lotKey
                ]
                    ? slots[
                        parking.lotKey
                    ]
                    : {};


            Object.values(
                currentSlots
            ).forEach(

                function (slot) {

                    total++;


                    const status =
                        String(
                            slot?.status ||
                            "available"
                        )
                            .toLowerCase();


                    if (
                        status ===
                        "available"
                    ) {

                        available++;

                    }

                }

            );


            if (total === 0) {

                if (
                    parking.lotKey ===
                    "mandai"
                ) {

                    total =
                        50;

                    available =
                        24;

                }

                else if (
                    parking.lotKey ===
                    "market"
                ) {

                    total =
                        40;

                    available =
                        18;

                }

                else if (
                    parking.lotKey ===
                    "budhwar"
                ) {

                    total =
                        30;

                    available =
                        3;

                }

            }


            let statusText =
                "Full";


            if (
                available > 5
            ) {

                statusText =
                    "Available";

            }

            else if (
                available > 0
            ) {

                statusText =
                    "Limited";

            }


            const marker =
                L.marker(

                    [
                        parking.lat,
                        parking.lng
                    ],

                    {

                        icon:
                            createParkingIcon(),

                        zIndexOffset:
                            500

                    }

                )
                    .addTo(
                        dashboardMap
                    );


            marker.bindPopup(`

                <div style="
                    min-width:220px;
                    font-family:Arial,sans-serif;
                ">

                    <div style="
                        font-size:17px;
                        font-weight:700;
                        margin-bottom:10px;
                    ">

                        🅿️ ${parking.name}

                    </div>

                    <div style="
                        margin-bottom:6px;
                    ">

                        <b>
                            ${available}
                        </b>

                        spaces available

                    </div>

                    <div style="
                        margin-bottom:6px;
                    ">

                        ${total}
                        total spaces

                    </div>

                    <div style="
                        font-weight:600;
                    ">

                        Status:
                        ${statusText}

                    </div>

                </div>

            `);


            dashboardParkingMarkers.push(
                marker
            );

        }

    );


    dashboardMap.setView(
        [
            18.5138,
            73.8553
        ],
        15
    );

}


/* =========================================================
   MAKE CANCEL FUNCTION AVAILABLE TO HTML
========================================================= */

window.cancelReservation =
    cancelReservation;


/* =========================================================
   FIND PARKING MAP
========================================================= */

function loadParkingMap() {

    const mapElement =
        document.getElementById(
            "parkingMap"
        );


    if (!mapElement) {

        console.log(
            "parkingMap element not found"
        );

        return;

    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet is not loaded."
        );

        toast(
            "Map library failed to load."
        );

        return;

    }


    if (parkingMap) {

        setTimeout(
            () => {

                parkingMap.invalidateSize();

            },
            200
        );

        return;

    }


    console.log(
        "Creating parking map..."
    );


    parkingMap =
        L.map(
            mapElement
        )
            .setView(
                [
                    18.5160,
                    73.8575
                ],
                15
            );


    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:
                19,

            attribution:
                "© OpenStreetMap contributors"

        }

    ).addTo(
        parkingMap
    );


    const locations = [

        {

            name:
                "Mandai Central Parking",

            lat:
                18.5148,

            lng:
                73.8575,

            rate:
                "₹20/hr"

        },

        {

            name:
                "Market East Parking",

            lat:
                18.5169,

            lng:
                73.8589,

            rate:
                "₹25/hr"

        },

        {

            name:
                "Budhwar Road Parking",

            lat:
                18.5177,

            lng:
                73.8547,

            rate:
                "₹20/hr"

        }

    ];


    locations.forEach(
        location => {

            const marker =
                L.marker(

                    [
                        location.lat,
                        location.lng
                    ]

                )
                    .addTo(
                        parkingMap
                    );


            marker.bindPopup(`

                <b>
                    🅿️ ${location.name}
                </b>

                <br>

                ${location.rate}

            `);

        }
    );


    setTimeout(
        () => {

            parkingMap.invalidateSize();

        },
        500
    );


    console.log(
        "Parking map loaded successfully."
    );

}


document.addEventListener("DOMContentLoaded", function () {
    const savedReceipt = localStorage.getItem(
        "mandaiParkLatestPayment"
    );

    const latestPayment = document.getElementById("latestPayment");

    if (savedReceipt && latestPayment) {
        latestPayment.innerHTML = savedReceipt;
    }
});



async function downloadPaymentReceipt() {
    const user = window.auth?.currentUser || window.currentUser;
    const receiptElement = document.getElementById("latestPayment");

    if (!user) {
        return toast("Please login first.");
    }

    if (
        !receiptElement ||
        receiptElement.innerText.includes("No payment yet") ||
        !window.activeReservation
    ) {
        return toast("Please complete a payment first.");
    }

    const reservation = window.activeReservation;
    const reservationId = reservation.reservationId;

    if (!reservationId) {
        return toast("Reservation ID not found.");
    }

    try {
        const receipt = {
            receiptId: reservationId,
            reservationId: reservationId,
            transactionId: reservation.transactionId || "",
            userId: user.uid,
            parking: reservation.lot || "—",
            slot: reservation.slot || "—",
            date: reservation.date || "",
            startTime: reservation.startTime || "",
            endTime: reservation.endTime || "",
            duration: reservation.duration ?? 0,
            amount: reservation.amount ?? 0,
            paymentMethod:
                document.getElementById("payMethod")?.value || "UPI",
            paymentStatus: "Paid",
            status: "Paid",
            reservationStatus: "Confirmed",
            savedAt: new Date().toISOString()
        };

        await window.firebaseSet(
            window.firebaseRef(
                window.database,
                `users/${user.uid}/receipts/${reservationId}`
            ),
            receipt
        );

        toast("Your receipt has been saved successfully! ✓");

        if (typeof window.renderHistory === "function") {
            await window.renderHistory();
        }

    } catch (error) {
        console.error("Receipt save failed:", error);
        toast("Could not save receipt. Please try again.");
    }
}

window.downloadPaymentReceipt = downloadPaymentReceipt;

// Restore the countdown after page reload
if (data.timerEnd) {
    if (timerInt) clearInterval(timerInt);

    timerInt = setInterval(updateTimer, 1000);
    updateTimer();
}