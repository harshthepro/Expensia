// ---
// Part 4: Theme Toggle Functionality
// ---

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggleBtn.querySelector('i');

    // Function to apply the saved theme on page load
    const applySavedTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
        if (savedTheme === 'light') {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    };

    // Event listener for the theme toggle button
    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            // Switch to light mode
            body.classList.replace('dark-mode', 'light-mode');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            // Switch to dark mode
            body.classList.replace('light-mode', 'dark-mode');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Apply the theme when the page loads
    applySavedTheme();
});

// ---
// Part 7: Expense CRUD & Modal Logic
// ---
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
const themeToggle = document.getElementById('theme-toggle');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleSignInBtn = document.getElementById('google-signin-btn');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const addExpenseBtn = document.getElementById('add-expense-btn');
const transactionList = document.getElementById('transaction-list');
// Expense Modal
const expenseModal = document.getElementById('expense-modal');
const closeModalBtn = document.getElementById('close-expense-modal-btn');
const modalCancelBtn = document.getElementById('expense-modal-cancel-btn');
const expenseForm = document.getElementById('expense-form');
// Charts
const pieChartCanvas = document.getElementById('category-pie-chart');
const barChartCanvas = document.getElementById('monthly-bar-chart');
// Budget
const setBudgetBtn = document.getElementById('set-budget-btn');
const budgetModal = document.getElementById('budget-modal');
const closeBudgetModalBtn = document.getElementById('close-budget-modal-btn');
const budgetModalCancelBtn = document.getElementById('budget-modal-cancel-btn');
const budgetForm = document.getElementById('budget-form');
const budgetAmountEl = document.getElementById('budget-amount');
const budgetProgressLinear = document.getElementById('budget-progress-linear');
const totalBalanceEl = document.getElementById('total-balance');
const monthlySpentEl = document.getElementById('monthly-spent');

// --- Theme Toggle Logic ---
function setTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    if (themeToggle) {
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        setTheme(!isDarkMode);
    });
}
const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme === 'dark' || !savedTheme);

// --- Authentication Logic ---
function toggleAuthForms() {
    loginForm?.classList.toggle('active');
    signupForm?.classList.toggle('active');
}

showSignup?.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(); });
showLogin?.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(); });

googleSignInBtn?.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(result => {
            console.log("Signed in with Google!", result.user);
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error("Google Sign-in Error", error);
        });
});

signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    const confirmPassword = signupForm['signup-confirm-password'].value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            console.log("Signed up!", userCredential.user);
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error("Signup Error", error);
            alert(error.message);
        });
});

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            console.log("Logged in!", userCredential.user);
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error("Login Error", error);
            alert(error.message);
        });
});

logoutBtn?.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("User signed out.");
        window.location.href = 'index.html';
    }).catch(error => {
        console.error("Sign out error", error);
    });
});

// --- Auth State Observer ---
onAuthStateChanged(auth, user => {
    const isAuthPage = window.location.pathname.includes('login.html');
    if (user) {
        if (isAuthPage) window.location.href = 'dashboard.html';
        getAndRenderData(user.uid); // Main data fetch function
    } else {
        if (!isAuthPage && !window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = 'login.html';
        }
    }
});

// --- Modal Logic ---
function showModal(modal) { modal?.classList.remove('hidden'); }
function hideModal(modal) { modal?.classList.add('hidden'); }

addExpenseBtn?.addEventListener('click', () => showModal(expenseModal));
closeModalBtn?.addEventListener('click', () => hideModal(expenseModal));
modalCancelBtn?.addEventListener('click', () => hideModal(expenseModal));

setBudgetBtn?.addEventListener('click', () => showModal(budgetModal));
closeBudgetModalBtn?.addEventListener('click', () => hideModal(budgetModal));
budgetModalCancelBtn?.addEventListener('click', () => hideModal(budgetModal));

// --- Main Data Fetch & Render Function ---
let userBudget = 0;
async function getAndRenderData(userId) {
    if (!userId) return;

    const budgetPromise = getDoc(doc(db, "budgets", userId));
    const expensesPromise = getDocs(query(collection(db, 'expenses'), where("userId", "==", userId)));

    try {
        const [budgetSnap, expensesSnapshot] = await Promise.all([budgetPromise, expensesPromise]);

        if (budgetSnap.exists()) {
            userBudget = budgetSnap.data().amount;
        } else {
            userBudget = 0;
        }

        const expenses = [];
        expensesSnapshot.forEach(doc => expenses.push({ id: doc.id, ...doc.data() }));

        renderTransactionList(expenses);
        updateSummaryCards(expenses);
        updateBudgetWidgets(expenses, userBudget);

        const categoryData = processDataForPieChart(expenses);
        drawPieChart(categoryData);
        const monthlyData = processDataForBarChart(expenses);
        drawBarChart(monthlyData);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// --- Component Rendering Functions ---
function renderTransactionList(expenses) {
    if (!transactionList) return;
    let expensesHtml = '';
    // Sort expenses by date, newest first
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    expenses.forEach(expense => {
        expensesHtml += `
            <div class="expense-card" data-id="${expense.id}">
                <div class="expense-details">
                    <div class="expense-icon">${getCategoryIcon(expense.category)}</div>
                    <div class="expense-info">
                        <p class="expense-category">${expense.category}</p>
                        <p class="expense-description">${expense.description}</p>
                    </div>
                </div>
                <div class="expense-meta">
                    <p class="expense-amount">-$${expense.amount.toFixed(2)}</p>
                    <p class="expense-date">${expense.date}</p>
                </div>
            </div>
        `;
    });
    transactionList.innerHTML = expensesHtml || "<p>No expenses found. Add one to get started!</p>";
}

function updateSummaryCards(expenses) {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlySpent = expenses
        .filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

    if (totalBalanceEl) totalBalanceEl.textContent = `-$${totalSpent.toFixed(2)}`;
    if (monthlySpentEl) monthlySpentEl.textContent = `-$${monthlySpent.toFixed(2)}`;
}

function updateBudgetWidgets(expenses, budget) {
    if (!budgetAmountEl) return;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlySpent = expenses
        .filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

    const percentage = budget > 0 ? (monthlySpent / budget) * 100 : 0;

    budgetAmountEl.textContent = `$${monthlySpent.toFixed(2)} / $${budget.toFixed(2)}`;
    budgetProgressLinear.style.width = `${Math.min(percentage, 100)}%`;

    if (percentage > 100) {
        budgetProgressLinear.classList.add('over-budget');
    } else {
        budgetProgressLinear.classList.remove('over-budget');
    }
}

// --- Firestore Save Functions ---
async function saveExpense(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const amount = parseFloat(expenseForm['expense-amount'].value);
    const category = expenseForm['expense-category'].value;
    const description = expenseForm['expense-description'].value;
    const date = expenseForm['expense-date'].value;

    try {
        await addDoc(collection(db, "expenses"), {
            userId: user.uid,
            amount,
            category,
            description,
            date,
            createdAt: new Date()
        });
        hideModal(expenseModal);
        expenseForm.reset();
        getAndRenderData(auth.currentUser.uid);
    } catch (error) { console.error("Error adding expense:", error); }
}
expenseForm?.addEventListener('submit', saveExpense);

async function saveBudget(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const amount = parseFloat(document.getElementById('budget-input').value);
    if (isNaN(amount) || amount < 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    try {
        await setDoc(doc(db, "budgets", user.uid), { amount: amount });
        hideModal(budgetModal);
        budgetForm.reset();
        getAndRenderData(user.uid);
    } catch (error) {
        console.error("Error setting budget:", error);
        alert("Failed to set budget.");
    }
}
budgetForm?.addEventListener('submit', saveBudget);

// --- Chart Drawing Logic ---
const categoryColors = {
    Food: '#36A2EB', Travel: '#4BC0C0', Shopping: '#FFCD56',
    Utilities: '#FF6384', Entertainment: '#9966FF', Savings: '#FF9F40', Other: '#C9CBCF'
};

function processDataForPieChart(expenses) {
    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return categoryTotals;
}

function drawPieChart(categoryData) {
    if (!pieChartCanvas) return;
    const ctx = pieChartCanvas.getContext('2d');

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = labels.map(label => categoryColors[label] || '#CCCCCC');

    let total = data.reduce((a, b) => a + b, 0);
    if (total === 0) { // Handle case with no data
        ctx.clearRect(0, 0, pieChartCanvas.width, pieChartCanvas.height);
        ctx.font = "16px Inter";
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#a0a0a0' : '#666';
        ctx.textAlign = "center";
        ctx.fillText("No expense data to display.", pieChartCanvas.width / 2, pieChartCanvas.height / 2);
        return;
    }

    let startAngle = -0.5 * Math.PI; // Start at the top

    function animateChart(progress) {
        ctx.clearRect(0, 0, pieChartCanvas.width, pieChartCanvas.height);
        let currentStartAngle = startAngle;

        for (let i = 0; i < data.length; i++) {
            const sliceAngle = (data[i] / total) * 2 * Math.PI;
            const endAngle = currentStartAngle + (sliceAngle * progress);
            
            ctx.beginPath();
            ctx.moveTo(pieChartCanvas.width / 2, pieChartCanvas.height / 2);
            ctx.arc(pieChartCanvas.width / 2, pieChartCanvas.height / 2, Math.min(pieChartCanvas.width, pieChartCanvas.height) / 2 - 20, currentStartAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors[i];
            ctx.shadowColor = colors[i];
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            currentStartAngle = endAngle;
        }

        // Doughnut hole
        ctx.beginPath();
        ctx.arc(pieChartCanvas.width / 2, pieChartCanvas.height / 2, Math.min(pieChartCanvas.width, pieChartCanvas.height) / 4, 0, 2 * Math.PI);
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#1a1a2e' : '#f4f7fc';
        ctx.fill();
    }
    
    let startTime = null;
    function animationLoop(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const duration = 1000; // 1 second animation
        let progress = Math.min(elapsedTime / duration, 1);
        
        animateChart(progress);

        if (progress < 1) requestAnimationFrame(animationLoop);
    }
    requestAnimationFrame(animationLoop);
}

function processDataForBarChart(expenses) {
    const monthlyTotals = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
        monthlyTotals[yearMonth] = (monthlyTotals[yearMonth] || 0) + expense.amount;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort().slice(-6);

    const labels = sortedMonths.map(ym => monthNames[parseInt(ym.split('-')[1])]);
    const data = sortedMonths.map(ym => monthlyTotals[ym]);

    return { labels, data };
}

function drawBarChart(monthlyData) {
    if (!barChartCanvas) return;
    const ctx = barChartCanvas.getContext('2d');
    const { labels, data } = monthlyData;

    if (data.length === 0) {
        ctx.clearRect(0, 0, barChartCanvas.width, barChartCanvas.height);
        ctx.font = "16px Inter";
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#a0a0a0' : '#666';
        ctx.textAlign = "center";
        ctx.fillText("No monthly data available.", barChartCanvas.width / 2, barChartCanvas.height / 2);
        return;
    }

    const barColor = 'rgba(80, 227, 194, 0.6)';
    const barGlow = 'rgba(80, 227, 194, 1)';
    const textColor = document.body.classList.contains('dark-mode') ? '#a0a0a0' : '#666';

    const maxValue = Math.max(...data) * 1.2;
    const barWidth = (barChartCanvas.width / data.length) * 0.6;
    const barSpacing = (barChartCanvas.width / data.length) * 0.4;

    let startTime = null;
    function animationLoop(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 1000, 1);
        ctx.clearRect(0, 0, barChartCanvas.width, barChartCanvas.height);

        data.forEach((value, i) => {
            const barHeight = (value / maxValue) * (barChartCanvas.height * 0.8) * progress;
            const x = (barWidth + barSpacing) * i + (barSpacing / 2);
            const y = barChartCanvas.height * 0.9 - barHeight;

            ctx.fillStyle = barColor;
            ctx.shadowColor = barGlow;
            ctx.shadowBlur = 10;
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.shadowBlur = 0;

            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x + barWidth / 2, barChartCanvas.height);
        });

        if (progress < 1) requestAnimationFrame(animationLoop);
    }
    requestAnimationFrame(animationLoop);
}

function getCategoryIcon(category) {
    const icons = {
        Food: '<i class="fas fa-utensils"></i>',
        Travel: '<i class="fas fa-plane"></i>',
        Shopping: '<i class="fas fa-shopping-cart"></i>',
        Utilities: '<i class="fas fa-bolt"></i>',
        Entertainment: '<i class="fas fa-film"></i>',
        Savings: '<i class="fas fa-piggy-bank"></i>'
    };
    return icons[category] || '<i class="fas fa-dollar-sign"></i>';
}
