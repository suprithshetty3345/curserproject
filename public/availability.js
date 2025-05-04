// Function to submit booking
function submitBooking(resource) {
    try {
        // Get current user's email
        const userEmail = getUserEmail();
        if (!userEmail) {
            showErrorMessage("User not logged in. Please login to book resources.");
            resetSubmitButton(document.querySelector('.btn-submit'));
            return;
        }

        console.log("Submitting booking for resource:", resource.id);

        // Get form values
        const bookingDate = document.getElementById('booking-date').value;
        const timeSlot = document.getElementById('booking-time').value;
        const duration = document.getElementById('booking-duration').value;
        const purpose = document.getElementById('booking-purpose').value;
        const attendees = document.getElementById('expected-attendees').value;
        
        // Optional fields
        const department = document.getElementById('department')?.value || '';
        const eventName = document.getElementById('event-name')?.value || '';

        // Validate form
        if (!bookingDate) {
            showErrorMessage("Please select a booking date.");
            resetSubmitButton(document.querySelector('.btn-submit'));
            return;
        }
        
        if (!timeSlot) {
            showErrorMessage("Please select a time slot.");
            resetSubmitButton(document.querySelector('.btn-submit'));
            return;
        }
        
        if (!purpose.trim()) {
            showErrorMessage("Please provide the purpose of your booking.");
            resetSubmitButton(document.querySelector('.btn-submit'));
            return;
        }
        
        if (!attendees || attendees < 1) {
            showErrorMessage("Please provide the number of expected attendees.");
            resetSubmitButton(document.querySelector('.btn-submit'));
            return;
        }
        
        // Additional validation for auditoriums
        if (resource.category === 'auditorium') {
            if (!department.trim()) {
                showErrorMessage("Please provide department information for auditorium booking.");
                resetSubmitButton(document.querySelector('.btn-submit'));
                return;
            }
            
            if (!eventName.trim()) {
                showErrorMessage("Please provide event name for auditorium booking.");
                resetSubmitButton(document.querySelector('.btn-submit'));
                return;
            }
        }
        
        // First check if the resource is available at the requested time
        console.log(`Checking availability for ${resource.id} on ${bookingDate} at ${timeSlot}`);
        
        fetch(`/api/resource-availability?resourceId=${resource.id}&date=${bookingDate}&time=${timeSlot}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to check resource availability');
                }
                return response.json();
            })
            .then(availabilityData => {
                console.log("Availability check result:", availabilityData);
                
                if (!availabilityData.available) {
                    // Resource is not available
                    showErrorMessage("This resource is already booked at this time. Please select another slot.");
                    resetSubmitButton(document.querySelector('.btn-submit'));
                    return;
                }
                
                // Resource is available, proceed with booking
                // Prepare booking data
                const bookingData = {
                    userEmail: userEmail,
                    resourceId: resource.id,
                    date: bookingDate,
                    time: timeSlot,
                    duration: duration,
                    purpose: purpose,
                    attendees: attendees,
                    captchaPattern: [1, 2, 3, 4, 5], // Dummy pattern for testing
                    booking_date: bookingDate,
                    time_slot: timeSlot
                };
                
                // Add additional fields for auditoriums
                if (resource.category === 'auditorium') {
                    bookingData.department = department;
                    bookingData.event = eventName;
                }
                
                // Determine endpoint
                const endpoint = resource.requiresApproval 
                    ? '/api/booking-requests' 
                    : '/api/bookings';
                    
                console.log("Submitting booking to:", endpoint);
                console.log("Booking data:", JSON.stringify(bookingData));
                
                // Submit booking
                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                })
                .then(response => {
                    console.log("Response status:", response.status);
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.error || 'Failed to submit booking');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Booking success response:", data);
                    // Hide modal
                    hideModal();
                    
                    // Show success message - IMPORTANT: Set isRedirect to false to allow continued browsing
                    const resourceName = resource.name || 'Resource';
                    if (resource.requiresApproval) {
                        showSuccessMessage(`Your request for ${resourceName} has been sent to admin for approval.`, false);
                    } else {
                        showSuccessMessage(`Your booking for ${resourceName} has been confirmed!`, false);
                    }
                    
                    // Refresh availability grid without redirecting
                    renderAvailabilityGrid();
                    
                    // Reset the submit button
                    resetSubmitButton(document.querySelector('.btn-submit'));
                })
                .catch(error => {
                    console.error('Error submitting booking:', error);
                    showErrorMessage(error.message || 'Failed to submit booking. Please try again.');
                    resetSubmitButton(document.querySelector('.btn-submit'));
                });
            })
            .catch(error => {
                console.error('Error checking resource availability:', error);
                showErrorMessage('Failed to check resource availability. Please try again.');
                resetSubmitButton(document.querySelector('.btn-submit'));
            });
        
    } catch (error) {
        console.error('Error in submitBooking:', error);
        showErrorMessage('An error occurred while submitting your booking. Please try again.');
        resetSubmitButton(document.querySelector('.btn-submit'));
    }
}

// Function to get user email
function getUserEmail() {
    // In a real app, this would come from the user session
    // For now, we'll fetch it from the user-name element
    const userNameElement = document.querySelector('.user-name');
    if (!userNameElement) return null;
    
    const email = userNameElement.textContent.trim();
    return email === 'User' || email === 'Loading...' ? null : email;
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Function to format time
function formatTime(timeString) {
    return timeString;
}

// Function to show success message
function showSuccessMessage(message, isRedirect = false) {
    const successElement = document.createElement('div');
    successElement.className = 'notification success';
    
    // Create a container for the message text
    const messageText = document.createElement('div');
    messageText.className = 'notification-message';
    messageText.textContent = message;
    
    // Add the message to the notification
    successElement.appendChild(messageText);
    
    // Create the action button container
    const actionContainer = document.createElement('div');
    actionContainer.className = 'notification-actions';
    
    // Add a view bookings button that opens in a new tab
    const viewBookingsBtn = document.createElement('button');
    viewBookingsBtn.className = 'notification-action';
    viewBookingsBtn.textContent = 'View My Bookings';
    viewBookingsBtn.addEventListener('click', () => {
        // Always open in a new tab to prevent disruption
        window.open('dashboard.html#my-bookings', '_blank');
    });
    
    // Add a close button that dismisses the notification
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'notification-action notification-dismiss';
    dismissBtn.textContent = 'Continue Browsing';
    dismissBtn.addEventListener('click', () => {
        successElement.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(successElement)) {
                document.body.removeChild(successElement);
            }
        }, 300);
    });
    
    // Add buttons to the action container
    actionContainer.appendChild(viewBookingsBtn);
    actionContainer.appendChild(dismissBtn);
    
    // Add the action container to the notification
    successElement.appendChild(actionContainer);
    
    // Add to the page
    document.body.appendChild(successElement);
    
    // Show notification
    setTimeout(() => {
        successElement.classList.add('show');
    }, 10);
    
    // Auto-remove after 8 seconds if not dismissed
    setTimeout(() => {
        if (document.body.contains(successElement)) {
            successElement.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(successElement)) {
                    document.body.removeChild(successElement);
                }
            }, 300);
        }
    }, 8000);
}

// Function to show error message
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'notification error';
    errorElement.textContent = message;
    
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        errorElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(errorElement);
        }, 300);
    }, 3000);
}

// Function to hide modal
function hideModal() {
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('show');
        
        setTimeout(() => {
            modalContainer.innerHTML = '';
        }, 300);
    }
}

// Function to render availability grid
async function renderAvailabilityGrid() {
    const date = document.getElementById('availability-date').value;
    const categoryFilter = document.getElementById('category-filter').value;
    
    try {
        // Show loading indicator
        const availabilityContainer = document.getElementById('availability-grid');
        availabilityContainer.innerHTML = `
            <div class="loading-indicator">
                <p>Loading resources...</p>
            </div>
        `;
        
        // Fetch resources
        const resourcesResponse = await fetch('/api/resources');
        if (!resourcesResponse.ok) {
            throw new Error('Failed to fetch resources');
        }
        
        const resources = await resourcesResponse.json();
        console.log(`Fetched ${resources.length} resources`);
        
        // Filter resources by category if needed
        const filteredResources = categoryFilter === 'all' ? 
            resources : 
            resources.filter(r => r.category === categoryFilter);
        
        console.log(`Filtered to ${filteredResources.length} resources in category: ${categoryFilter}`);
        
        // Clear container
        availabilityContainer.innerHTML = '';
        
        // If no resources match the filter
        if (filteredResources.length === 0) {
            availabilityContainer.innerHTML = `
                <div class="no-resources">
                    <p>No resources found for the selected category.</p>
                </div>
            `;
            return;
        }
        
        // Group resources by category for better organization
        const resourcesByCategory = {};
        filteredResources.forEach(resource => {
            if (!resourcesByCategory[resource.category]) {
                resourcesByCategory[resource.category] = [];
            }
            resourcesByCategory[resource.category].push(resource);
        });
        
        // For each category, create a section
        for (const [category, categoryResources] of Object.entries(resourcesByCategory)) {
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'resource-category';
            categorySection.innerHTML = `
                <h2 class="category-title">${getCategoryDisplayName(category)}</h2>
            `;
            availabilityContainer.appendChild(categorySection);
            
            // For each resource in this category, create a resource card
            for (const resource of categoryResources) {
                // Create resource section
                const resourceSection = document.createElement('div');
                resourceSection.className = 'resource-availability';
                
                // Build the resource card
                resourceSection.innerHTML = `
                    <div class="resource-header">
                        <div class="resource-info">
                            <h3 class="resource-name">${resource.name}</h3>
                            <div class="resource-details">
                                <span><strong>Location:</strong> ${resource.location}</span>
                                <span><strong>Capacity:</strong> ${resource.capacity}</span>
                                <span><strong>Type:</strong> ${resource.type}</span>
                            </div>
                            <p class="resource-description">${resource.description}</p>
                            <div class="resource-facilities">
                                <strong>Facilities:</strong> ${resource.facilities}
                            </div>
                        </div>
                        <div class="resource-actions">
                            <button class="btn-view-slots" onclick="viewResourceAvailability('${resource.id}')">View Availability</button>
                            <button class="btn-book" onclick="openBookingModal('${resource.id}')">Book Now</button>
                        </div>
                    </div>
                `;
                
                // Add the resource section to the category section
                categorySection.appendChild(resourceSection);
            }
        }
        
        // Add category-specific styles
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .resource-category {
                margin-bottom: 30px;
            }
            
            .category-title {
                font-size: 22px;
                color: #2c3e50;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #eee;
            }
            
            .resource-description {
                margin: 8px 0;
                color: #555;
            }
            
            .resource-facilities {
                font-size: 14px;
                color: #666;
                margin-top: 8px;
            }
            
            .resource-actions {
                display: flex;
                gap: 10px;
                margin-top: 16px;
                justify-content: flex-end;
            }
            
            .btn-view-slots {
                background-color: #6c757d;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            
            .btn-view-slots:hover {
                background-color: #5a6268;
            }
        `;
        document.head.appendChild(styleElement);
        
    } catch (error) {
        console.error('Error rendering availability grid:', error);
        document.getElementById('availability-grid').innerHTML = `
            <div class="error-message">
                <p>Error loading availability data: ${error.message}</p>
                <button onclick="renderAvailabilityGrid()">Try Again</button>
            </div>
        `;
    }
}

// Helper function to get display name for resource categories
function getCategoryDisplayName(category) {
    switch(category) {
        case 'stadium':
            return 'Indoor Stadiums';
        case 'field':
            return 'Outdoor Fields';
        case 'seminar':
            return 'Seminar Halls';
        case 'auditorium':
            return 'Auditoriums';
        default:
            return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

// Function to open booking modal
async function openBookingModal(resourceId) {
    try {
        // Fetch resource details
        const resourcesResponse = await fetch('/api/resources');
        if (!resourcesResponse.ok) {
            throw new Error('Failed to fetch resources');
        }
        
        const resources = await resourcesResponse.json();
        const resource = resources.find(r => r.id === resourceId);
        
        if (!resource) {
            throw new Error('Resource not found');
        }
        
        // Create modal content
        const date = document.getElementById('availability-date').value;
        const formattedDate = formatDate(date);
        
        // Fetch availability data for this date to show booked slots
        const availabilityResponse = await fetch(`/api/availability?date=${date}&resourceId=${resourceId}`);
        if (!availabilityResponse.ok) {
            throw new Error('Failed to fetch resource availability');
        }
        
        const availabilityData = await availabilityResponse.json();
        console.log('Availability data:', availabilityData);
        
        // Extract booked time slots
        const bookedTimeSlots = new Set();
        
        // Add confirmed bookings
        (availabilityData.bookings || []).forEach(booking => {
            const timeSlot = booking.time_slot || booking.time;
            if (timeSlot) {
                bookedTimeSlots.add(timeSlot);
            }
        });
        
        // Add pending requests
        (availabilityData.requests || []).forEach(request => {
            const timeSlot = request.time_slot || request.time;
            if (timeSlot) {
                bookedTimeSlots.add(timeSlot);
            }
        });
        
        console.log('Booked time slots:', [...bookedTimeSlots]);
        
        const modalContent = `
            <div class="booking-modal">
                <h2>Book ${resource.name}</h2>
                <form id="booking-form">
                    <input type="hidden" id="resource-id" value="${resource.id}">
                    
                    <div class="form-group">
                        <label for="booking-date">Date:</label>
                        <input type="date" id="booking-date" value="${date}" ${resource.category === 'stadium' || resource.category === 'field' ? 'readonly' : ''}>
                        <p class="field-note">${getDateRestrictionNote(resource.category)}</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="booking-time">Time Slot:</label>
                        <select id="booking-time" required>
                            ${generateTimeOptions(resource.category, bookedTimeSlots)}
                        </select>
                        <p class="field-note available-slots-note">${bookedTimeSlots.size > 0 ? 'Time slots marked as "Booked" are not available for selection.' : 'All time slots are available for this date.'}</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="booking-duration">Duration (hours):</label>
                        <select id="booking-duration" required>
                            <option value="1">1 hour</option>
                            <option value="2">2 hours</option>
                            ${resource.category === 'auditorium' || resource.category === 'seminar' ? 
                                `<option value="3">3 hours</option>
                                <option value="4">4 hours</option>` : 
                                ''}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="booking-purpose">Purpose:</label>
                        <select id="booking-purpose" required class="form-control">
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
                        <label for="expected-attendees">Expected Attendees:</label>
                        <input type="number" id="expected-attendees" required min="1" max="${resource.capacity}" value="1">
                        <p class="field-note">Maximum capacity: ${resource.capacity}</p>
                    </div>
                    
                    ${resource.category === 'auditorium' ? `
                    <div class="form-group">
                        <label for="department">Department:</label>
                        <input type="text" id="department" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-name">Event Name:</label>
                        <input type="text" id="event-name" required>
                    </div>
                    ` : ''}
                    
                    <div class="approval-note ${resource.requiresApproval ? '' : 'hidden'}">
                        <p><strong>Note:</strong> This booking requires admin approval. Your request will be reviewed by the administrator.</p>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="hideModal()">Cancel</button>
                        <button type="button" class="btn-submit" onclick="handleBookingSubmit('${resource.id}')">${resource.requiresApproval ? 'Submit Request' : 'Confirm Booking'}</button>
                    </div>
                </form>
            </div>
        `;
        
        // Show modal
        showModal(modalContent);
        
    } catch (error) {
        console.error('Error opening booking modal:', error);
        showErrorMessage(error.message || 'Failed to open booking form. Please try again.');
    }
}

// Function to get date restriction note based on resource category
function getDateRestrictionNote(category) {
    switch (category) {
        case 'stadium':
        case 'field':
            return 'Bookings are only available for today.';
        case 'seminar':
            return 'Bookings are available up to 10 days in advance.';
        case 'auditorium':
            return 'Bookings are available up to 30 days in advance.';
        default:
            return '';
    }
}

// Function to generate time options based on resource category and booked slots
function generateTimeOptions(category, bookedTimeSlots) {
    let startHour = 8; // Default start at 8 AM
    let endHour = 20; // Default end at 8 PM
    
    switch (category) {
        case 'stadium':
            startHour = 14; // 2 PM
            endHour = 20; // 8 PM
            break;
        case 'field':
            startHour = 5; // 5 AM
            endHour = 18; // 6 PM
            break;
        case 'seminar':
            startHour = 8; // 8 AM
            endHour = 18; // 6 PM
            break;
        case 'auditorium':
            startHour = 9; // 9 AM
            endHour = 21; // 9 PM
            break;
    }
    
    let options = '';
    for (let hour = startHour; hour < endHour; hour++) {
        const time24h = `${hour}:00`;
        const time12h = hour > 12 ? `${hour-12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
        
        // Check if this slot is booked
        const isBooked = bookedTimeSlots.has(time24h);
        
        if (isBooked) {
            // Add a disabled option for booked slots
            options += `<option value="${time24h}" disabled style="color: #999; background-color: #f5f5f5;">${time12h} (Booked)</option>`;
        } else {
            options += `<option value="${time24h}">${time12h}</option>`;
        }
    }
    
    return options;
}

// Function to handle booking form submission
async function handleBookingSubmit(resourceId) {
    try {
        // Get form data
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const duration = document.getElementById('booking-duration').value;
        const purpose = document.getElementById('booking-purpose').value;
        const attendees = document.getElementById('expected-attendees').value;
        
        // Additional fields for auditoriums
        let department = '';
        let eventName = '';
        const departmentField = document.getElementById('department');
        const eventNameField = document.getElementById('event-name');
        
        if (departmentField && eventNameField) {
            department = departmentField.value;
            eventName = eventNameField.value;
        }
        
        // Get user email
        const userEmail = getUserEmail();
        if (!userEmail) {
            showErrorMessage('You must be logged in to book a resource.');
            return;
        }
        
        // Validate form data
        if (!date || !time || !duration || !purpose || !attendees) {
            showErrorMessage('Please fill in all required fields.');
            return;
        }
        
        // Fetch resource to check if approval required
        const resourcesResponse = await fetch('/api/resources');
        const resources = await resourcesResponse.json();
        const resource = resources.find(r => r.id === resourceId);
        
        if (!resource) {
            throw new Error('Resource not found');
        }

        // Check if resource is frozen
        const frozenResponse = await fetch('/api/resources/frozen');
        const frozenResources = await frozenResponse.json();
        
        const isFrozen = frozenResources.some(fr => fr.resourceId === resourceId);
        if (isFrozen) {
            showErrorMessage('This resource is currently unavailable for booking.');
            hideModal();
            return;
        }
        
        // Construct booking data
        const bookingData = {
            resourceId,
            date,
            time,
            duration,
            purpose,
            attendees,
            userEmail,
            captchaPattern: 'VERIFIED_PATTERN' // This is a placeholder for a real CAPTCHA
        };
        
        // Add additional fields for auditoriums if they exist
        if (department) bookingData.department = department;
        if (eventName) bookingData.event = eventName;
        
        console.log('Submitting booking:', bookingData);
        
        let endpoint;
        let successMessage;
        
        if (resource.requiresApproval) {
            // For resources requiring approval
            endpoint = '/api/booking-requests';
            successMessage = `Your booking request for ${resource.name} has been submitted and is pending approval.`;
        } else {
            // For direct booking resources
            endpoint = '/api/bookings';
            successMessage = `Your booking for ${resource.name} has been confirmed!`;
        }
        
        // Submit the booking request
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit booking.');
        }
        
        // Success! Hide the modal and show success message
        hideModal();
        
        // Display success message without redirecting
        showSuccessMessage(successMessage, false);
        
        // Update UI to reflect new booking (re-render availability grid)
        renderAvailabilityGrid();
        
    } catch (error) {
        console.error('Error submitting booking:', error);
        showErrorMessage(error.message || 'Failed to submit booking. Please try again.');
    }
}

// Helper function to reset submit button
function resetSubmitButton(submitBtn) {
    if (submitBtn) {
        const isRequest = submitBtn.textContent.includes('Request');
        submitBtn.textContent = isRequest ? 'Submit Request' : 'Confirm Booking';
        submitBtn.disabled = false;
    }
}

// Function to show modal
function showModal(content) {
    // Create modal container if it doesn't exist
    let modalContainer = document.querySelector('.modal-container');
    
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    // Set modal content
    modalContainer.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-box">
            <button class="modal-close">&times;</button>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    // Show modal
    setTimeout(() => {
        modalContainer.classList.add('show');
    }, 10);
    
    // Add event listener for close button
    const closeBtn = modalContainer.querySelector('.modal-close');
    closeBtn.addEventListener('click', hideModal);
    
    // Add event listener for overlay click
    const overlay = modalContainer.querySelector('.modal-overlay');
    overlay.addEventListener('click', hideModal);
}

// Function to view resource availability
async function viewResourceAvailability(resourceId) {
    try {
        // Fetch resource details
        const resourcesResponse = await fetch('/api/resources');
        if (!resourcesResponse.ok) {
            throw new Error('Failed to fetch resources');
        }
        
        const resources = await resourcesResponse.json();
        const resource = resources.find(r => r.id === resourceId);
        
        if (!resource) {
            throw new Error('Resource not found');
        }
        
        // Get current date and next 10 days for date selection
        const currentDate = new Date();
        const dateOptions = [];
        
        // Add 10 date options starting from today
        for (let i = 0; i < 10; i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dateFormatted = formatDate(dateStr);
            dateOptions.push({ value: dateStr, label: dateFormatted });
        }
        
        // Create modal content with date selector
        const modalContent = `
            <div class="availability-view-modal">
                <h2>Availability for ${resource.name}</h2>
                
                <div class="availability-date-selector">
                    <label for="availability-date-select">Select Date:</label>
                    <select id="availability-date-select" onchange="loadDateAvailability('${resource.id}', this.value)">
                        ${dateOptions.map(date => `<option value="${date.value}">${date.label}</option>`).join('')}
                    </select>
                </div>
                
                <div class="availability-rules">
                    <p><strong>Booking Rules:</strong> ${getDateRestrictionNote(resource.category)}</p>
                </div>
                
                <div id="date-availability-container" class="date-availability-container">
                    <div class="loading-indicator">Loading availability data...</div>
                </div>
                
                <div class="availability-legend">
                    <div class="legend-item">
                        <span class="legend-color available"></span>
                        <span>Available</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color booked"></span>
                        <span>Booked</span>
                    </div>
                </div>
                
                <div class="availability-actions">
                    <button class="btn-book-now" onclick="openBookingModal('${resource.id}')">Book Now</button>
                    <button class="btn-close" onclick="hideModal()">Close</button>
                </div>
            </div>
        `;
        
        // Show modal
        showModal(modalContent);
        
        // Load availability for the first date
        loadDateAvailability(resource.id, dateOptions[0].value);
        
    } catch (error) {
        console.error('Error viewing resource availability:', error);
        showErrorMessage(error.message || 'Failed to load availability data. Please try again.');
    }
}

// Function to load availability data for a specific date
async function loadDateAvailability(resourceId, date) {
    try {
        const container = document.getElementById('date-availability-container');
        container.innerHTML = '<div class="loading-indicator">Loading availability data...</div>';
        
        // Fetch resource details
        const resourcesResponse = await fetch('/api/resources');
        if (!resourcesResponse.ok) {
            throw new Error('Failed to fetch resources');
        }
        
        const resources = await resourcesResponse.json();
        const resource = resources.find(r => r.id === resourceId);
        
        if (!resource) {
            throw new Error('Resource not found');
        }
        
        // Fetch availability data for this date
        const availabilityResponse = await fetch(`/api/availability?date=${date}&resourceId=${resourceId}`);
        if (!availabilityResponse.ok) {
            throw new Error('Failed to fetch resource availability');
        }
        
        const availabilityData = await availabilityResponse.json();
        console.log('Availability data for', date, ':', availabilityData);
        
        // Extract booked time slots
        const bookedTimeSlots = new Set();
        
        // Add confirmed bookings
        (availabilityData.bookings || []).forEach(booking => {
            const timeSlot = booking.time_slot || booking.time;
            if (timeSlot) {
                bookedTimeSlots.add(timeSlot);
            }
        });
        
        // Add pending requests
        (availabilityData.requests || []).forEach(request => {
            const timeSlot = request.time_slot || request.time;
            if (timeSlot) {
                bookedTimeSlots.add(timeSlot);
            }
        });
        
        // Get valid time slots for this resource type
        const availableSlots = getTimeSlots(resource.category);
        const formattedDate = formatDate(date);
        
        // Create availability content
        let html = `
            <div class="date-availability-header">
                <h3>📅 ${formattedDate}</h3>
            </div>
        `;
        
        // Generate the time slots grid
        html += `<div class="availability-slots-grid">`;
        
        // Check if there are any slots for this resource category
        if (availableSlots.length === 0) {
            html += `<p class="no-slots-message">No available time slots for this resource on this date.</p>`;
        } else {
            availableSlots.forEach(slot => {
                const isBooked = bookedTimeSlots.has(slot.value);
                const statusClass = isBooked ? 'booked' : 'available';
                const statusIcon = isBooked ? '❌' : '✅';
                const statusText = isBooked ? 'Booked' : 'Available';
                const bookButtonDisplay = isBooked ? 'none' : 'block';
                
                html += `
                    <div class="time-slot ${statusClass}">
                        <div class="slot-time">${statusIcon} ${slot.label}</div>
                        <div class="slot-status">${statusText}</div>
                        <button 
                            class="btn-book-slot" 
                            onclick="bookSpecificSlot('${resourceId}', '${date}', '${slot.value}')"
                            style="display: ${bookButtonDisplay}">
                            Book
                        </button>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        
        // Update the container with the availability data
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading date availability:', error);
        document.getElementById('date-availability-container').innerHTML = `
            <div class="error-message">
                <p>Error loading availability data: ${error.message}</p>
                <button onclick="loadDateAvailability('${resourceId}', '${date}')">Try Again</button>
            </div>
        `;
    }
}

// Function to book a specific time slot
function bookSpecificSlot(resourceId, date, timeSlot) {
    // Update the date in the page's date picker to match selected date
    document.getElementById('availability-date').value = date;
    
    // Hide the modal
    hideModal();
    
    // Open the booking modal with the selected resource, date and time
    openBookingModalWithDateTime(resourceId, date, timeSlot);
}

// Function to open booking modal with specific date and time
async function openBookingModalWithDateTime(resourceId, date, timeSlot) {
    try {
        // Fetch resource details
        const resourcesResponse = await fetch('/api/resources');
        if (!resourcesResponse.ok) {
            throw new Error('Failed to fetch resources');
        }
        
        const resources = await resourcesResponse.json();
        const resource = resources.find(r => r.id === resourceId);
        
        if (!resource) {
            throw new Error('Resource not found');
        }
        
        const formattedDate = formatDate(date);
        
        // Create modal content
        const modalContent = `
            <div class="booking-modal">
                <h2>Book ${resource.name}</h2>
                <form id="booking-form">
                    <input type="hidden" id="resource-id" value="${resource.id}">
                    
                    <div class="form-group">
                        <label for="booking-date">Date:</label>
                        <input type="date" id="booking-date" value="${date}" ${resource.category === 'stadium' || resource.category === 'field' ? 'readonly' : ''}>
                        <p class="field-note">${getDateRestrictionNote(resource.category)}</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="booking-time">Time Slot:</label>
                        <select id="booking-time" required>
                            <option value="${timeSlot}" selected>${formatTimeSlot(timeSlot)}</option>
                        </select>
                        <p class="field-note">Selected time slot: ${formatTimeSlot(timeSlot)}</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="booking-duration">Duration (hours):</label>
                        <select id="booking-duration" required>
                            <option value="1">1 hour</option>
                            <option value="2">2 hours</option>
                            ${resource.category === 'auditorium' || resource.category === 'seminar' ? 
                                `<option value="3">3 hours</option>
                                <option value="4">4 hours</option>` : 
                                ''}
                        </select>
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
                        <label for="expected-attendees">Expected Attendees:</label>
                        <input type="number" id="expected-attendees" required min="1" max="${resource.capacity}" value="1">
                        <p class="field-note">Maximum capacity: ${resource.capacity}</p>
                    </div>
                    
                    ${resource.category === 'auditorium' ? `
                    <div class="form-group">
                        <label for="department">Department:</label>
                        <input type="text" id="department" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-name">Event Name:</label>
                        <input type="text" id="event-name" required>
                    </div>
                    ` : ''}
                    
                    <div class="approval-note ${resource.requiresApproval ? '' : 'hidden'}">
                        <p><strong>Note:</strong> This booking requires admin approval. Your request will be reviewed by the administrator.</p>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="hideModal()">Cancel</button>
                        <button type="button" class="btn-submit" onclick="handleBookingSubmit('${resource.id}')">${resource.requiresApproval ? 'Submit Request' : 'Confirm Booking'}</button>
                    </div>
                </form>
            </div>
        `;
        
        // Show modal
        showModal(modalContent);
        
    } catch (error) {
        console.error('Error opening booking modal with date and time:', error);
        showErrorMessage(error.message || 'Failed to open booking form. Please try again.');
    }
}

// Helper function to format time slot display
function formatTimeSlot(timeSlot) {
    const [hours] = timeSlot.split(':');
    const hour = parseInt(hours);
    return hour > 12 ? `${hour-12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
}

// Function to get time slots for a specific resource category
function getTimeSlots(category) {
    let startHour = 8; // Default start at 8 AM
    let endHour = 20; // Default end at 8 PM
    
    switch (category) {
        case 'stadium':
            startHour = 14; // 2 PM
            endHour = 20; // 8 PM
            break;
        case 'field':
            startHour = 5; // 5 AM
            endHour = 18; // 6 PM
            break;
        case 'seminar':
            startHour = 8; // 8 AM
            endHour = 18; // 6 PM
            break;
        case 'auditorium':
            startHour = 9; // 9 AM
            endHour = 21; // 9 PM
            break;
    }
    
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        const time24h = `${hour}:00`;
        const time12h = hour > 12 ? `${hour-12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
        
        slots.push({
            value: time24h,
            label: time12h
        });
    }
    
    return slots;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('availability-date').value = dateString;
    
    // Add event listeners
    document.getElementById('availability-date').addEventListener('change', renderAvailabilityGrid);
    document.getElementById('category-filter').addEventListener('change', renderAvailabilityGrid);
    
    // Initial render
    renderAvailabilityGrid();
});