// In-memory data stores
const users = [
    { email: 'user1@example.com', password: 'password123', name: 'Test User 1' },
    { email: 'user2@example.com', password: 'password123', name: 'Test User 2' },
    { email: 'rakesh.is22@bmsce.ac.in', password: 'password123', name: 'Rakesh' }
];

const admins = [
    { email: 'admin@example.com', password: 'admin123', name: 'Main Admin', role: 'super_admin', resources: ['all'] },
    { email: 'sports.admin@example.com', password: 'admin123', name: 'Sports Admin', role: 'resource_admin', resources: ['badminton_court_1', 'badminton_court_2', 'badminton_court_3', 'main_sports_field'] },
    { email: 'academic.admin@example.com', password: 'admin123', name: 'Academic Admin', role: 'resource_admin', resources: ['cs_seminar_hall', 'is_seminar_hall', 'ec_seminar_hall', 'aiml_seminar_hall', 'mech_seminar_hall'] },
    { email: 'jubilee.admin@example.com', password: 'admin123', name: 'Jubilee Admin', role: 'resource_admin', resources: ['jubilee_auditorium_1', 'jubilee_auditorium_2'] }
];

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
        requiresApproval: false, // Direct booking
        adminContact: 'sports.admin@example.com'
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
        requiresApproval: false, // Direct booking
        adminContact: 'sports.admin@example.com'
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
        requiresApproval: false, // Direct booking
        adminContact: 'sports.admin@example.com'
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
        requiresApproval: false, // Direct booking
        adminContact: 'sports.admin@example.com'
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
        adminContact: 'cs.admin@example.com'
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
        adminContact: 'is.admin@example.com'
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
        adminContact: 'ec.admin@example.com'
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
        adminContact: 'aiml.admin@example.com'
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
        adminContact: 'mech.admin@example.com'
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
        adminContact: 'jubilee.admin@example.com'
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
        adminContact: 'jubilee.admin@example.com'
    }
];

// In-memory storage for bookings and requests
// ... existing code ... 

// Email notification system
const emailTemplates = {
    // Template for direct booking confirmation
    bookingConfirmation: (userName, resourceName, date, time, duration) => `
        Hello ${userName},
        
        Your booking for ${resourceName} has been confirmed for ${date} at ${time} for ${duration} hour(s).
        
        Please arrive on time and follow all facility guidelines. If you need to cancel your booking, 
        please do so at least 24 hours in advance.
        
        Thank you for using our booking system.
        
        Best regards,
        Resource Management Team
    `,
    
    // Template for booking request submission
    requestSubmission: (userName, resourceName, date, time, duration) => `
        Hello ${userName},
        
        Your booking request for ${resourceName} on ${date} at ${time} for ${duration} hour(s) has been submitted.
        
        The administrator will review your request and you will be notified once it has been processed.
        ${resourceName.includes('Auditorium') ? 
          `\nNote: Auditorium bookings typically require 2-3 business days for approval.` : 
          `\nTypical processing time is 24-48 hours.`}
        
        Thank you for your patience.
        
        Best regards,
        Resource Management Team
    `,
    
    // Template for request approval notification
    requestApproval: (userName, resourceName, date, time, duration, adminNotes) => `
        Hello ${userName},
        
        Great news! Your booking request for ${resourceName} on ${date} at ${time} for ${duration} hour(s) has been APPROVED.
        
        ${adminNotes ? `Admin notes: ${adminNotes}` : ''}
        
        ${resourceName.includes('Auditorium') ? 
          `\nImportant: For auditorium bookings, please contact the facility manager at least 2 hours before your event to arrange setup.` : 
          `\nPlease arrive on time and follow all facility guidelines.`}
        
        If you need to cancel your booking, please do so at least 24 hours in advance.
        
        Thank you for using our booking system.
        
        Best regards,
        Resource Management Team
    `,
    
    // Template for request rejection notification
    requestRejection: (userName, resourceName, date, time, duration, adminNotes) => `
        Hello ${userName},
        
        We regret to inform you that your booking request for ${resourceName} on ${date} at ${time} for ${duration} hour(s) has been REJECTED.
        
        ${adminNotes ? `Reason: ${adminNotes}` : 'This could be due to scheduling conflicts or resource availability issues.'}
        
        ${resourceName.includes('Auditorium') ? 
          `\nFor auditorium bookings, you may want to check alternative dates or consider a different venue for your event.` : 
          `\nYou are welcome to submit another request for a different time or date.`}
        
        If you have any questions, please contact the administrator.
        
        Best regards,
        Resource Management Team
    `,
    
    // Template for admin notification of new request
    adminNewRequest: (adminName, userName, resourceName, date, time, duration, purpose, attendees) => `
        Hello ${adminName},
        
        A new booking request requires your attention:
        
        Resource: ${resourceName}
        Requested by: ${userName}
        Date: ${date}
        Time: ${time}
        Duration: ${duration} hour(s)
        Purpose: ${purpose}
        Expected Attendees: ${attendees}
        
        ${resourceName.includes('Auditorium') ? 
          `\nThis is an auditorium booking request. Please verify event details and facility availability before approval.` : 
          `\nPlease review this request at your earliest convenience.`}
        
        You can approve or reject this request from your admin dashboard.
        
        Thank you,
        Resource Management System
    `
};

// Function to send email notifications
const sendEmailNotification = (to, subject, content) => {
    // In a production environment, we would use nodemailer to send actual emails
    // For this example, we'll just log the email content
    console.log('\n--- EMAIL NOTIFICATION ---');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT: ${content}`);
    console.log('-------------------------\n');
    
    // In production:
    /*
    return transporter.sendMail({
        from: 'resource-management@example.com',
        to: to,
        subject: subject,
        text: content
    });
    */
};

// Process booking request (approve/reject)
app.post('/api/booking-requests/process', ensureUserLoggedIn, ensureAdminUser, async (req, res) => {
    try {
        const { requestId, action, adminNotes } = req.body;
        
        // Validate request ID
        if (!requestId || !action) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        // Check if action is valid
        if (action !== 'approve' && action !== 'reject') {
            return res.status(400).json({ success: false, message: 'Invalid action' });
        }
        
        // Get request details
        const request = db.bookingRequests.find(r => r.requestId === requestId);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Booking request not found' });
        }
        
        // Update request status
        request.status = action === 'approve' ? 'approved' : 'rejected';
        request.adminNotes = adminNotes || '';
        request.processedBy = req.session.user.email;
        request.processedAt = new Date().toISOString();
        
        // If approved, create a new booking
        if (action === 'approve') {
            const newBooking = {
                bookingId: generateId(),
                resourceId: request.resourceId,
                userEmail: request.userEmail,
                userName: request.userName,
                purpose: request.purpose,
                attendees: request.attendees,
                date: request.date,
                time: request.time,
                booking_date: request.booking_date, // Ensure booking_date is transferred
                time_slot: request.time_slot,     // Ensure time_slot is transferred
                duration: request.duration,
                createdAt: new Date().toISOString()
            };
            
            db.bookings.push(newBooking);
            saveDatabase();
            
            // Send email notification
            sendEmail(
                request.userEmail,
                'Booking Request Approved',
                bookingRequestApproved(request.userName, getResourceName(request.resourceId), 
                    formatDate(request.date), request.time, request.duration, adminNotes)
            );
            
            console.log(`Booking request ${requestId} approved and created booking ${newBooking.bookingId}`);
            
            // Add notification for user in the database
            addUserNotification(request.userEmail, {
                id: generateId(),
                type: 'booking_approved',
                title: 'Booking Request Approved',
                message: `Your booking request for ${getResourceName(request.resourceId)} on ${formatDate(request.date)} at ${request.time} has been approved.`,
                resourceId: request.resourceId,
                bookingId: newBooking.bookingId,
                date: new Date().toISOString(),
                read: false
            });
            
            return res.json({ 
                success: true, 
                message: 'Booking request approved', 
                request: request,
                newBookingId: newBooking.bookingId
            });
        } else {
            // Request was rejected
            saveDatabase();
            
            // Send email notification
            sendEmail(
                request.userEmail,
                'Booking Request Rejected',
                bookingRequestRejected(request.userName, getResourceName(request.resourceId), 
                    formatDate(request.date), request.time, request.duration, adminNotes)
            );
            
            console.log(`Booking request ${requestId} rejected`);
            
            // Add notification for user in the database
            addUserNotification(request.userEmail, {
                id: generateId(),
                type: 'booking_rejected',
                title: 'Booking Request Rejected',
                message: `Your booking request for ${getResourceName(request.resourceId)} on ${formatDate(request.date)} at ${request.time} has been rejected.`,
                resourceId: request.resourceId,
                requestId: request.requestId,
                date: new Date().toISOString(),
                read: false,
                adminNotes: adminNotes || ''
            });
            
            return res.json({ 
                success: true, 
                message: 'Booking request rejected', 
                request: request 
            });
        }
        
    } catch (error) {
        console.error('Error processing booking request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Helper function to add user notification
function addUserNotification(userEmail, notification) {
    if (!db.userNotifications) {
        db.userNotifications = [];
    }
    
    db.userNotifications.push({
        ...notification,
        userEmail
    });
    
    saveDatabase();
}

// Get user notifications
app.get('/api/user/notifications', ensureUserLoggedIn, (req, res) => {
    try {
        const userEmail = req.session.user.email;
        
        // If userNotifications doesn't exist, create it
        if (!db.userNotifications) {
            db.userNotifications = [];
            saveDatabase();
        }
        
        // Get user's notifications
        const notifications = db.userNotifications
            .filter(n => n.userEmail === userEmail)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json(notifications);
    } catch (error) {
        console.error('Error getting user notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark notification as read
app.post('/api/user/notifications/mark-read', ensureUserLoggedIn, (req, res) => {
    try {
        const { notificationId } = req.body;
        const userEmail = req.session.user.email;
        
        if (!notificationId) {
            return res.status(400).json({ success: false, message: 'Notification ID is required' });
        }
        
        // Find the notification
        const notification = db.userNotifications.find(
            n => n.id === notificationId && n.userEmail === userEmail
        );
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        // Mark as read
        notification.read = true;
        saveDatabase();
        
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all booking requests with filters
app.get('/api/admin/booking-requests', ensureUserLoggedIn, ensureAdminUser, (req, res) => {
    try {
        // Apply filters if provided
        let requests = [...db.bookingRequests]; // Clone the array
        const { status, startDate, endDate, resourceType } = req.query;
        
        // Filter by status
        if (status && status !== 'all') {
            requests = requests.filter(req => req.status === status);
        }
        
        // Filter by date range if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Set to end of day
            
            requests = requests.filter(req => {
                const reqDate = new Date(req.date);
                return reqDate >= start && reqDate <= end;
            });
        }
        
        // Filter by resource type if provided
        if (resourceType && resourceType !== 'all') {
            requests = requests.filter(req => {
                const resource = resources.find(r => r.id === req.resourceId);
                return resource && resource.category === resourceType;
            });
        }
        
        // For each request, add the resource name for easier reference
        requests = requests.map(req => {
            const resource = resources.find(r => r.id === req.resourceId);
            return {
                ...req,
                resourceName: resource ? resource.name : req.resourceId
            };
        });
        
        // Sort by date, most recent first
        requests.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        
        res.json(requests);
    } catch (error) {
        console.error('Error getting booking requests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get count of pending booking requests
app.get('/api/admin/booking-count', ensureUserLoggedIn, ensureAdminUser, (req, res) => {
    try {
        // Count pending requests
        const pendingCount = db.bookingRequests.filter(req => req.status === 'pending').length;
        
        // Count approved and rejected requests
        const approvedCount = db.bookingRequests.filter(req => req.status === 'approved').length;
        const rejectedCount = db.bookingRequests.filter(req => req.status === 'rejected').length;
        
        // Return counts
        res.json({
            pendingCount,
            approvedCount,
            rejectedCount,
            totalCount: db.bookingRequests.length
        });
    } catch (error) {
        console.error('Error getting booking count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); 