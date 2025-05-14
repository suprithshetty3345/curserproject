// Resource definitions with their details
const resources = [
    // Indoor Stadiums - Direct Booking
    {
        id: 'badminton_court_1',
        name: 'Badminton Court 1',
        type: 'indoor',
        category: 'stadium',
        description: 'Professional-grade badminton court with proper lighting and flooring.',
        capacity: '4 players',
        location: 'Indoor Stadium, Ground Floor',
        facilities: 'Proper lighting, professional flooring, equipment rental',
        requiresApproval: true, // Changed to require approval
        adminContact: 'sports.admin@example.com',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea'
    },
    {
        id: 'badminton_court_2',
        name: 'Badminton Court 2',
        type: 'indoor',
        category: 'stadium',
        description: 'Standard badminton court with equipment available on request.',
        capacity: '4 players',
        location: 'Indoor Stadium, Ground Floor',
        facilities: 'Standard lighting, equipment rental available',
        requiresApproval: true, // Changed to require approval
        adminContact: 'sports.admin@example.com',
        image: 'https://images.unsplash.com/photo-1613074884777-88a764f9d1b8'
    },
    {
        id: 'badminton_court_3',
        name: 'Badminton Court 3',
        type: 'indoor',
        category: 'stadium',
        description: 'Tournament-ready badminton court with spectator seating.',
        capacity: '4 players + spectators',
        location: 'Indoor Stadium, First Floor',
        facilities: 'Professional lighting, spectator seating, equipment rental',
        requiresApproval: true, // Changed to require approval
        adminContact: 'sports.admin@example.com',
        image: 'https://images.unsplash.com/photo-1625377389601-8782cfb2cc70'
    },
    
    // Open Fields - Direct Booking
    {
        id: 'main_sports_field',
        name: 'Main Sports Field',
        type: 'outdoor',
        category: 'field',
        description: 'Multi-purpose open field suitable for football, cricket, and athletic events.',
        capacity: '50+ players',
        location: 'Central Campus',
        facilities: 'Marked boundaries, equipment storage, drinking water',
        requiresApproval: true, // Changed to require approval
        adminContact: 'sports.admin@example.com',
        image: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d'
    },
    
    // Seminar Halls - Require Approval
    {
        id: 'cs_seminar_hall',
        name: 'CS Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'Computer Science department seminar hall with advanced presentation equipment.',
        capacity: '120 people',
        location: 'CS Department, Block A, Second Floor',
        facilities: 'Projector, sound system, podium, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminContact: 'cs.admin@example.com',
        image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205'
    },
    {
        id: 'is_seminar_hall',
        name: 'IS Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'Information Science department seminar hall with modern AV systems.',
        capacity: '100 people',
        location: 'IS Department, Block B, First Floor',
        facilities: 'Projector, sound system, podium, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminContact: 'is.admin@example.com',
        image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2'
    },
    {
        id: 'ec_seminar_hall',
        name: 'EC Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'Well-equipped hall for electronics presentations and demonstrations.',
        capacity: '90 people',
        location: 'EC Department, Block C, First Floor',
        facilities: 'Projector, sound system, demo table, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminContact: 'ec.admin@example.com',
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678'
    },
    {
        id: 'aiml_seminar_hall',
        name: 'AIML Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'AI & ML department seminar hall with smart presentation capabilities.',
        capacity: '80 people',
        location: 'AIML Department, Block D, Ground Floor',
        facilities: 'Smart display, sound system, interactive board, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminContact: 'aiml.admin@example.com',
        image: 'https://images.unsplash.com/photo-1570126646281-5ec88111777f'
    },
    {
        id: 'mech_seminar_hall',
        name: 'Mechanical Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'Mechanical Engineering department seminar hall with demonstration capabilities.',
        capacity: '130 people',
        location: 'Mechanical Department, Block E, Second Floor',
        facilities: 'Projector, sound system, demo area, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminContact: 'mech.admin@example.com',
        image: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef'
    },
    
    // Auditoriums - Require Approval
    {
        id: 'jubilee_auditorium_1',
        name: 'Jubilee Auditorium 1',
        type: 'indoor',
        category: 'auditorium',
        description: 'Large auditorium suitable for conferences, cultural programs, and major events.',
        capacity: '500 people',
        location: 'Jubilee Block, Ground Floor',
        facilities: 'Stage, professional sound and lighting, green rooms, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminContact: 'jubilee.admin@example.com',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
    },
    {
        id: 'jubilee_auditorium_2',
        name: 'Jubilee Auditorium 2',
        type: 'indoor',
        category: 'auditorium',
        description: 'Medium-sized auditorium with state-of-the-art acoustics and lighting.',
        capacity: '350 people',
        location: 'Jubilee Block, First Floor',
        facilities: 'Stage, professional sound and lighting, backstage area, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminContact: 'jubilee.admin@example.com',
        image: 'https://images.unsplash.com/photo-1580212296325-a484fb99835b'
    }
];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing dashboard...');
    
    // Check user session
    checkUserSession();
    
    // Setup components 
    setupSearch();
    setupResourceCardButtons();
    setupResourceFiltering();
    setupFilterButtons();
    
    // Initial loading of frozen resources and update UI
    updateFrozenResourcesUI();
    
    // Set interval to refresh frozen resources every 30 seconds
    setInterval(updateFrozenResourcesUI, 30000);
});

// Update frozen resources UI
async function updateFrozenResourcesUI() {
    try {
        // Fetch frozen resources
        const response = await fetch('/api/resources/frozen', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch frozen resources');
        }
        
        const frozenResources = await response.json();
        
        // Update resource cards
        const resourceCards = document.querySelectorAll('.resource-card');
        
        resourceCards.forEach(card => {
            const resourceId = card.querySelector('.book-btn')?.getAttribute('data-resource-id');
            if (!resourceId) return;
            
            const isFrozen = frozenResources.some(item => item.resourceId === resourceId);
            const frozenResource = frozenResources.find(item => item.resourceId === resourceId);
            
            // Update card UI based on frozen status
            if (isFrozen) {
                card.classList.add('frozen');
                
                // Add or update the frozen status badge
                let statusBadge = card.querySelector('.resource-status');
                if (!statusBadge) {
                    statusBadge = document.createElement('div');
                    statusBadge.className = 'resource-status resource-frozen';
                    const cardBody = card.querySelector('.card-body');
                    if (cardBody) {
                        cardBody.prepend(statusBadge);
                    }
                } else {
                    statusBadge.className = 'resource-status resource-frozen';
                }
                
                statusBadge.textContent = 'TEMPORARILY UNAVAILABLE';
                statusBadge.title = frozenResource?.reason || 'Booking unavailable for this resource at the moment.';
            } else {
                card.classList.remove('frozen');
                
                // Remove frozen status badge if exists
                const statusBadge = card.querySelector('.resource-status');
                if (statusBadge) {
                    statusBadge.remove();
                }
            }
        });
    } catch (error) {
        console.error('Error updating frozen resources UI:', error);
    }
}

// Initialize the dashboard components
function initializeDashboard() {
    console.log('Initializing dashboard components...');
    
    // Set up filter buttons
    setupFilterButtons();
    
    // Set up search functionality
    setupSearchFunctionality();
    
    // Setup resource card buttons (important for booking functionality)
    setupResourceCardButtons();
    
    // Fetch user bookings from server
    fetchUserBookings();
}

// Set up filter buttons to filter resources by type
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const resourceCards = document.querySelectorAll('.resource-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Show or hide resource cards based on filter
            let visibleCount = 0;
            resourceCards.forEach(card => {
                const resourceType = card.querySelector('.resource-tag').textContent.toLowerCase();
                
                if (filter === 'all' || resourceType.includes(filter)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show no results message if no cards match the filter
            const noResultsMessage = document.querySelector('.no-results-message');
            if (visibleCount === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        });
    });
}

// Set up search functionality to filter resources by name
function setupSearchFunctionality() {
    const searchInput = document.getElementById('resource-search');
    const resourceCards = document.querySelectorAll('.resource-card');
    const noResultsMessage = document.querySelector('.no-results-message');
    
    searchInput.addEventListener('input', function() {
        const searchValue = this.value.toLowerCase().trim();
        
        // If search is empty, revert to current filter
        if (searchValue === '') {
            document.querySelector('.filter-btn.active').click();
            return;
        }
        
        // Filter cards based on resource name
        let visibleCount = 0;
        resourceCards.forEach(card => {
            const resourceName = card.querySelector('.card-title').textContent.toLowerCase();
            
            if (resourceName.includes(searchValue)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show no results message if no cards match the search
        if (visibleCount === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    });
}

// Fetch user bookings from server
function fetchUserBookings() {
    console.log('Fetching user bookings...');

    // Fetch confirmed bookings
    fetch('/api/user/bookings', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }
        return response.json();
    })
    .then(bookings => {
        console.log('Received bookings data:', bookings);
        renderConfirmedBookings(bookings);
    })
    .catch(error => {
        console.error('Error fetching confirmed bookings:', error);
    });

    // Fetch booking requests
    fetch('/api/user/booking-requests', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch booking requests');
        }
        return response.json();
    })
    .then(requests => {
        console.log('Received booking requests data:', requests);
        renderBookingRequests(requests);
    })
    .catch(error => {
        console.error('Error fetching booking requests:', error);
    });
}

// Render confirmed bookings in the UI
function renderConfirmedBookings(bookings) {
    const confirmedContainer = document.getElementById('confirmed-bookings');
    
    if (!confirmedContainer) {
        console.error('Confirmed bookings container not found!');
        return;
    }
    
    if (!bookings || bookings.length === 0) {
        confirmedContainer.innerHTML = `
            <div class="empty-bookings">
                <p>You don't have any confirmed bookings yet.</p>
                <p>Browse the resources below to make a booking.</p>
            </div>
        `;
        return;
    }
    
    confirmedContainer.innerHTML = '';
    
    bookings.forEach(booking => {
        const bookingItem = createBookingItem(booking, 'confirmed');
        confirmedContainer.appendChild(bookingItem);
    });
}

// Render booking requests in the UI
function renderBookingRequests(requests) {
    const pendingContainer = document.getElementById('pending-bookings');
    
    if (!pendingContainer) {
        console.error('Pending bookings container not found!');
        return;
    }
    
    if (!requests || requests.length === 0) {
        pendingContainer.innerHTML = `
            <div class="empty-bookings">
                <p>You don't have any pending booking requests.</p>
                <p>Browse the auditoriums and seminar halls to submit a booking request.</p>
            </div>
        `;
        return;
    }
    
    pendingContainer.innerHTML = '';
    
    requests.forEach(request => {
        const requestItem = createBookingItem(request, 'pending');
        pendingContainer.appendChild(requestItem);
    });
}

// Create a booking item element
function createBookingItem(booking, type) {
    const item = document.createElement('div');
    item.className = 'booking-item';
    
    // Format date
    const bookingDate = new Date(booking.date || booking.booking_date).toLocaleDateString(undefined, { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    // Determine status class and text
    let statusClass, statusText;
    
    if (type === 'confirmed') {
        statusClass = 'status-confirmed';
        statusText = 'Confirmed';
    } else {
        // For requests, check the status
        switch(booking.status) {
            case 'approved':
                statusClass = 'status-confirmed';
                statusText = 'Approved';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusText = 'Rejected';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Pending Approval';
        }
    }
    
    // Get resource name from booking data
    const resourceName = booking.resourceName || 'Resource';
    
    item.innerHTML = `
        <div class="booking-details">
            <div class="booking-resource">${resourceName}</div>
            <div class="booking-meta">${bookingDate}, ${booking.time || booking.time_slot} for ${booking.duration || '1'} hour${booking.duration > 1 ? 's' : ''}</div>
        </div>
        <div class="booking-status">
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="booking-actions">
            <button class="action-btn view-btn" data-id="${booking.id || booking.requestId}" data-type="${type}">View</button>
            <button class="action-btn cancel-btn" data-id="${booking.id || booking.requestId}" data-type="${type}">Cancel</button>
        </div>
    `;
    
    // Add event listeners for the buttons
    item.querySelector('.view-btn').addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const bookingType = this.getAttribute('data-type');
        viewBookingDetails(id, bookingType, booking);
    });
    
    item.querySelector('.cancel-btn').addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const bookingType = this.getAttribute('data-type');
        cancelBooking(id, bookingType);
    });
    
    return item;
}

// View booking details
function viewBookingDetails(id, type, bookingData) {
    // Create a modal to display booking details
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    // Format date
    const bookingDate = new Date(bookingData.date || bookingData.booking_date).toLocaleDateString(undefined, { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    // Determine status for display
    let statusClass, statusText;
    if (type === 'confirmed') {
        statusClass = 'status-confirmed';
        statusText = 'Confirmed';
    } else {
        // For requests, check the status
        switch(bookingData.status) {
            case 'approved':
                statusClass = 'status-confirmed';
                statusText = 'Approved';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusText = 'Rejected';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Pending Approval';
        }
    }
    
    // Get resource name from booking data
    const resourceName = bookingData.resourceName || 'Resource';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Booking Details</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="booking-detail-item">
                    <span class="detail-label">Resource:</span>
                    <span class="detail-value">${resourceName}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${bookingDate}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${bookingData.time || bookingData.time_slot}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${bookingData.duration || '1'} hour${bookingData.duration > 1 ? 's' : ''}</span>
                </div>
                <div class="booking-detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value status-badge ${statusClass}">${statusText}</span>
                </div>
                ${bookingData.purpose ? `
                <div class="booking-detail-item">
                    <span class="detail-label">Purpose:</span>
                    <span class="detail-value">${bookingData.purpose}</span>
                </div>` : ''}
                ${bookingData.attendees ? `
                <div class="booking-detail-item">
                    <span class="detail-label">Attendees:</span>
                    <span class="detail-value">${bookingData.attendees}</span>
                </div>` : ''}
                ${bookingData.department ? `
                <div class="booking-detail-item">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${bookingData.department}</span>
                </div>` : ''}
                ${bookingData.event ? `
                <div class="booking-detail-item">
                    <span class="detail-label">Event:</span>
                    <span class="detail-value">${bookingData.event}</span>
                </div>` : ''}
                <div class="booking-detail-item">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${id}</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn" id="closeModalBtn">Close</button>
                <button class="modal-btn" id="cancelBookingBtn" style="background-color: #f44336; color: white;">Cancel Booking</button>
            </div>
        </div>
    `;
    
    // Add the modal to the body
    document.body.appendChild(modal);
    
    // Add event listeners to the modal buttons
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#closeModalBtn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#cancelBookingBtn').addEventListener('click', function() {
        document.body.removeChild(modal);
        cancelBooking(id, type);
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Cancel a booking
function cancelBooking(id, type) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    const endpoint = type === 'confirmed' 
        ? `/api/user/bookings/${id}` 
        : `/api/user/booking-requests/${id}`;
    
    fetch(endpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        alert('Booking cancelled successfully');
        
        // Refresh bookings
        fetchUserBookings();
    })
    .catch(error => {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
    });
}

// Function to check if a resource is frozen
async function isResourceFrozen(resourceId) {
    try {
        const response = await fetch('/api/resources/frozen', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch frozen resources');
        }
        
        const frozenResources = await response.json();
        return frozenResources.find(item => item.resourceId === resourceId);
    } catch (error) {
        console.error('Error checking if resource is frozen:', error);
        return null;
    }
}

// Set up resource card buttons
function setupResourceCardButtons() {
    const buttons = document.querySelectorAll('.resource-action');
    console.log('Found', buttons.length, 'resource action buttons');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            
            // Get resource information
            const card = button.closest('.resource-card');
            const resourceId = card.getAttribute('data-resource-id');
            const resourceName = card.querySelector('.resource-name').textContent;
            const resourceType = card.getAttribute('data-resource-type');
            
            console.log('Resource clicked:', resourceId, resourceName, resourceType);
            
            // Check if resource is frozen
            isResourceFrozen(resourceId)
                .then(frozen => {
                    if (frozen) {
                        // Show warning for frozen resource
                        Swal.fire({
                            icon: 'warning',
                            title: 'Resource Unavailable',
                            text: 'This resource is currently unavailable for booking.',
                            confirmButtonText: 'OK'
                        });
                        return;
                    }
                    
                    // Handle based on resource type
                    if (resourceType === 'auditorium' || resourceType === 'seminar-hall') {
                        // Redirect to availability page for these types
                        window.location.href = `/availability?resource=${resourceId}`;
                    } else {
                        // Show booking request form for other types (courts, etc.)
                        showBookingRequestForm(resourceId, resourceName);
                    }
                })
                .catch(error => {
                    console.error('Error checking if resource is frozen:', error);
                    // Default to showing the booking form/page
                    if (resourceType === 'auditorium' || resourceType === 'seminar-hall') {
                        window.location.href = `/availability?resource=${resourceId}`;
                    } else {
                        showBookingRequestForm(resourceId, resourceName);
                    }
                });
        });
    });
}

// Show booking request form for direct bookings (courts, etc.)
function showBookingRequestForm(resourceId, resourceName) {
    console.log('Showing booking request form for:', resourceId, resourceName);
    
    // Create modal elements
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Create form
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>Book ${resourceName}</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="booking-request-form">
                <div class="form-group">
                    <label for="booking-date">Date</label>
                    <input type="date" id="booking-date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="booking-time">Start Time</label>
                        <input type="time" id="booking-time" required>
                    </div>
                    <div class="form-group">
                        <label for="booking-duration">Duration (hours)</label>
                        <select id="booking-duration" required>
                            <option value="1">1 hour</option>
                            <option value="2">2 hours</option>
                            <option value="3">3 hours</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="bookingPurpose">Purpose</label>
                    <select id="bookingPurpose" name="purpose" class="form-control" required>
                        <option value="" disabled selected>Select purpose</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Sports Event">Sports Event</option>
                        <option value="Cultural Program">Cultural Program</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="booking-attendees">Expected Attendees</label>
                    <input type="number" id="booking-attendees" required min="1" placeholder="Number of people">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn primary">Submit Request</button>
                    <button type="button" class="btn secondary close-modal">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    // Add to DOM
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Handle close button clicks
    const closeButtons = modalContainer.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
    });
    
    // Handle form submission
    const form = modalContainer.querySelector('#booking-request-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const date = form.querySelector('#booking-date').value;
        const time = form.querySelector('#booking-time').value;
        const duration = form.querySelector('#booking-duration').value;
        const purpose = form.querySelector('#booking-purpose').value;
        const attendees = form.querySelector('#booking-attendees').value;
        
        // Submit booking request
        submitBookingRequest(resourceId, resourceName, date, time, duration, purpose, attendees);
    });
}

// Handle booking request submission
function submitBookingRequest(resourceId, resourceName, date, startTime, endTime, purpose, attendees) {
    console.log('Submitting booking request for resource:', resourceId);
    
    // Create request data
    const requestData = {
        resourceId: resourceId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        purpose: purpose,
        expectedAttendees: attendees
    };
    
    // Send booking request to server
    fetch('/api/user/booking-requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit booking request');
        }
        return response.json();
    })
    .then(data => {
        console.log('Booking request submitted successfully:', data);
        
        // Remove modal
        const modal = document.querySelector('.modal-container');
        if (modal) {
            modal.remove();
        }
        
        // Show success message
        showSuccessMessage(`Your booking request for ${resourceName} has been submitted successfully. Request ID: ${data.requestId}. Status: ${data.status}`);
    })
    .catch(error => {
        console.error('Error submitting booking request:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to submit booking request. Please try again.'
        });
    });
}

// Show success message as a notification
function showSuccessMessage(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <p>${message}</p>
        <button class="notification-action" onclick="window.location.href='/dashboard'">View My Bookings</button>
    `;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function setupResourceFiltering() {
    // Function to update resource cards based on availability and frozen status
    async function updateResourceCards(cards) {
        // Get frozen resources
        let frozenResources = [];
        try {
            const response = await fetch('/api/resources/frozen', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                frozenResources = await response.json();
            }
        } catch (error) {
            console.error('Error fetching frozen resources:', error);
        }
        
        // Update each card with frozen status
        cards.forEach(card => {
            const resourceId = card.querySelector('.book-btn').getAttribute('data-resource-id');
            const frozenResource = frozenResources.find(item => item.resourceId === resourceId);
            
            if (frozenResource) {
                // Add frozen indicator to card
                const statusBadge = card.querySelector('.resource-status') || document.createElement('div');
                statusBadge.className = 'resource-status resource-frozen';
                statusBadge.textContent = 'TEMPORARILY UNAVAILABLE';
                
                // If the card doesn't already have the status badge, add it
                if (!card.querySelector('.resource-status')) {
                    card.querySelector('.card-body').prepend(statusBadge);
                }
                
                // Add title with reason
                statusBadge.title = frozenResource.reason || 'Booking unavailable for this resource at the moment.';
            } else {
                // Remove frozen indicator if exists
                const frozenBadge = card.querySelector('.resource-status.resource-frozen');
                if (frozenBadge) {
                    frozenBadge.remove();
                }
            }
        });
    }
    
    // Update frozen status on initial load
    const resourceCards = document.querySelectorAll('.resource-card');
    updateResourceCards(resourceCards);
}

document.addEventListener('DOMContentLoaded', function () {
    const eventsList = document.getElementById('events-list');
    const addEventForm = document.getElementById('add-event-form');
    const eventTitleInput = document.getElementById('event-title');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventImageInput = document.getElementById('event-image');

    // Load existing events from localStorage
    const events = JSON.parse(localStorage.getItem('events')) || [];

    // Function to render a single event
    function renderEvent(event) {
        eventsList.innerHTML = ''; // Clear the list
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${event.image}" alt="${event.title}" />
            <div>
                <strong>${event.title}</strong>
                <p>${event.description}</p>
            </div>
        `;
        eventsList.appendChild(li);
    }

    // Function to rotate events
    function rotateEvents() {
        if (events.length > 1) {
            let currentIndex = 0;
            setInterval(() => {
                renderEvent(events[currentIndex]);
                currentIndex = (currentIndex + 1) % events.length; // Loop back to the first event
            }, 5000); // Change event every 5 seconds
        } else if (events.length === 1) {
            renderEvent(events[0]); // Show the single event
        }
    }

    // Handle form submission
    addEventForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const reader = new FileReader();
        const file = eventImageInput.files[0];

        reader.onload = function () {
            const newEvent = {
                title: eventTitleInput.value,
                description: eventDescriptionInput.value,
                image: reader.result, // Base64 image data
            };

            // Add new event to the list and save to localStorage
            events.push(newEvent);
            localStorage.setItem('events', JSON.stringify(events));

            // Clear the form
            eventTitleInput.value = '';
            eventDescriptionInput.value = '';
            eventImageInput.value = '';

            // Re-render the events
            rotateEvents();
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    });

    // Initial render and start rotation
    rotateEvents();
});

function showBookingForm(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Book ${resource.name}</h2>
            <form id="bookingForm">
                <div class="form-group">
                    <label for="date">Date:</label>
                    <input type="date" id="date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="startTime">Start Time:</label>
                    <input type="time" id="startTime" required>
                </div>
                <div class="form-group">
                    <label for="endTime">End Time:</label>
                    <input type="time" id="endTime" required>
                </div>
                <div class="form-group">
                    <label for="purpose">Purpose:</label>
                    <textarea id="purpose" required></textarea>
                </div>
                <div class="form-group">
                    <label for="attendees">Number of Attendees:</label>
                    <input type="number" id="attendees" required min="1" max="${resource.capacity}">
                </div>
                <div class="form-group">
                    <label for="contact">Contact Number:</label>
                    <input type="tel" id="contact" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="additionalInfo">Additional Information:</label>
                    <textarea id="additionalInfo"></textarea>
                </div>
                <div class="approval-notice">
                    <i class="fas fa-info-circle"></i>
                    This resource requires admin approval. Your booking will be pending until approved.
                </div>
                <button type="submit" class="btn btn-primary">Submit Booking Request</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.remove();
    };

    const form = modal.querySelector('#bookingForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const bookingData = {
            resourceId: resource.id,
            date: document.getElementById('date').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            purpose: document.getElementById('purpose').value,
            attendees: document.getElementById('attendees').value,
            contact: document.getElementById('contact').value,
            email: document.getElementById('email').value,
            additionalInfo: document.getElementById('additionalInfo').value,
            status: 'pending'
        };

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();
            
            if (response.ok) {
                showToast('Booking request submitted successfully. Waiting for admin approval.', 'success');
                modal.remove();
                loadBookings(); // Refresh the bookings list
            } else {
                showToast(data.error || 'Failed to submit booking request', 'error');
            }
        } catch (error) {
            showToast('Error submitting booking request', 'error');
        }
    };
}