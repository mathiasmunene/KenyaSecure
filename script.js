// Base URL for the json-server API
const apiUrl = 'http://localhost:3000/criminals'; // Replace with your JSON server endpoint

// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const criminalTable = document.getElementById('criminalTable').getElementsByTagName('tbody')[0];
const criminalSearchInput = document.getElementById('criminalSearch');
const searchBtn = document.getElementById('searchBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addOffenseForm = document.getElementById('addOffenseForm');

// Fetch all criminals from the server
async function fetchCriminals() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displayCriminals(data);
    } catch (error) {
        console.error('Error fetching criminal data:', error);
    }
}

// Display criminals in the table
function displayCriminals(data) {
    criminalTable.innerHTML = ''; // Clear existing rows
    data.forEach(criminal => {
        let row = criminalTable.insertRow();
        row.innerHTML = `
            <td>${criminal.name}</td>
            <td>${criminal.national_id}</td>
            <td>${criminal.age}</td>
            <td>${criminal.address}</td>
            <td>${criminal.offenses.map(o => `${o.crime} (${o.status})`).join(', ')}</td>
            <td><button onclick="viewCriminal(${criminal.id})">View Record</button></td>
        `;
    });
}

// View detailed criminal record
function viewCriminal(id) {
    fetch(`${apiUrl}/${id}`)
        .then(response => response.json())
        .then(criminal => {
            alert(`Criminal Record:\n\nName: ${criminal.name}\nID: ${criminal.national_id}\nOffenses: ${criminal.offenses.map(o => `${o.crime} (${o.status})`).join('\n')}`);
        })
        .catch(error => console.error('Error fetching criminal record:', error));
}

// Event listeners
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    fetchCriminals(); // Fetch criminals after login
});

searchBtn.addEventListener('click', () => {
    const searchTerm = criminalSearchInput.value.trim().toLowerCase();
    if (!searchTerm) return alert("Please enter a search term.");

    // Search both by name or national ID
    const searchUrl = `${apiUrl}?q=${searchTerm}`;
    
    fetch(searchUrl)
        .then(response => response.json())
        .then(filteredCriminals => {
            if (filteredCriminals.length === 0) {
                alert('No records found');
            } else {
                displayCriminals(filteredCriminals);
            }
        })
        .catch(error => console.error('Error searching criminals:', error));
});


// Add new offense
addOffenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const crime = document.getElementById('crime').value;
    const crimeDate = document.getElementById('crimeDate').value;
    const description = document.getElementById('description').value;

    const offense = {
        crime,
        date: crimeDate,
        description,
        status: 'Pending' // New offense status
    };

    const criminalId = 1; // Example: add offense to criminal with ID 1 (replace with actual ID based on your logic)

    fetch(`${apiUrl}/${criminalId}`)
        .then(response => response.json())
        .then(criminal => {
            criminal.offenses.push(offense);
            return fetch(`${apiUrl}/${criminalId}`, {
                method: 'PATCH',
                body: JSON.stringify(criminal),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        })
        .then(() => {
            alert('Offense added successfully!');
            fetchCriminals(); // Refresh table to show updated offenses
        })
        .catch(error => console.error('Error adding offense:', error));
});

// Function to display a modal with detailed criminal record
function showCriminalModal(criminal) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h3>${criminal.name}'s Record</h3>
            <p><strong>ID:</strong> ${criminal.national_id}</p>
            <p><strong>Age:</strong> ${criminal.age}</p>
            <p><strong>Address:</strong> ${criminal.address}</p>
            <h4>Offenses:</h4>
            <ul>
                ${criminal.offenses.map(o => `<li>${o.crime} (${o.status}) - ${o.date}</li>`).join('')}
            </ul>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal when clicking the close button
    modal.querySelector('.close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// View detailed criminal record (now opening a modal)
function viewCriminal(id) {
    fetch(`${apiUrl}/${id}`)
        .then(response => response.json())
        .then(criminal => {
            showCriminalModal(criminal);
        })
        .catch(error => console.error('Error fetching criminal record:', error));
}

