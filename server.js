const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use cors middleware with proper configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware for CORS (as a backup for older browsers)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Admin Roles
const ADMIN_ROLES = {
    SUPER_ADMIN: 'super_admin',
    SPORTS_ADMIN: 'sports_admin',
    SEMINAR_ADMIN: 'seminar_admin',
    AUDITORIUM_ADMIN: 'auditorium_admin'
};

// In-memory user store for demo purposes
const users = [
    // Pre-populated test user for easy login
    {
        id: 1,
        email: 'test@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        created_at: new Date(),
        is_admin: false
    }
];

// In-memory admin store
const admins = [
    // Sports facilities admin (controls Indoor Stadium and Open Field)
    {
        id: 1,
        email: 'sports.admin@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        role: ADMIN_ROLES.SPORTS_ADMIN,
        manages: ['indoor_stadium', 'open_field'],
        created_at: new Date()
    },
    // Seminar Hall admins (each manages their own department hall)
    {
        id: 2,
        email: 'cs.admin@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        role: ADMIN_ROLES.SEMINAR_ADMIN,
        manages: ['cs_seminar_hall'],
        created_at: new Date()
    },
    {
        id: 3,
        email: 'is.admin@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        role: ADMIN_ROLES.SEMINAR_ADMIN,
        manages: ['is_seminar_hall'],
        created_at: new Date()
    },
    {
        id: 4,
        email: 'ec.admin@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        role: ADMIN_ROLES.SEMINAR_ADMIN,
        manages: ['ec_seminar_hall'],
        created_at: new Date()
    },
    {
        id: 5,
        email: 'aiml.admin@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        role: ADMIN_ROLES.SEMINAR_ADMIN,
        manages: ['aiml_seminar_hall'],
        created_at: new Date()
    },
    {
        id: 6,
        email: 'mech.admin@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        role: ADMIN_ROLES.SEMINAR_ADMIN,
        manages: ['mech_seminar_hall'],
        created_at: new Date()
    },
    // Auditorium admin
    {
        id: 7,
        email: 'jubilee.admin@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        role: ADMIN_ROLES.AUDITORIUM_ADMIN,
        manages: ['jubilee_auditorium_1', 'jubilee_auditorium_2'],
        created_at: new Date()
    },
    // Super admin (can manage everything)
    {
        id: 8,
        email: 'super.admin@example.com',
        password: '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T5v7O3.M4XHC', // Password: 123456
        role: ADMIN_ROLES.SUPER_ADMIN,
        manages: ['all'],
        created_at: new Date()
    }
];

// Resource mapping to their codes
const RESOURCE_CODES = {
    // Indoor Stadium
    'badminton_court_1': 'indoor_stadium',
    'badminton_court_2': 'indoor_stadium',
    'badminton_court_3': 'indoor_stadium',
    // Open Field
    'main_sports_field': 'open_field',
    // Seminar Halls
    'cs_seminar_hall': 'cs_seminar_hall',
    'is_seminar_hall': 'is_seminar_hall',
    'ec_seminar_hall': 'ec_seminar_hall',
    'aiml_seminar_hall': 'aiml_seminar_hall',
    'mech_seminar_hall': 'mech_seminar_hall',
    // Auditoriums
    'jubilee_auditorium_1': 'jubilee_auditorium_1',
    'jubilee_auditorium_2': 'jubilee_auditorium_2'
};

// Resources requiring admin approval
const RESOURCES_REQUIRING_APPROVAL = [
    'cs_seminar_hall',
    'is_seminar_hall',
    'ec_seminar_hall',
    'aiml_seminar_hall',
    'mech_seminar_hall',
    'jubilee_auditorium_1',
    'jubilee_auditorium_2'
];

// Resource display names for emails and UI
const resourceNameMapping = {
    'badminton_court_1': 'Badminton Court 1',
    'badminton_court_2': 'Badminton Court 2',
    'badminton_court_3': 'Badminton Court 3',
    'main_sports_field': 'Main Sports Field',
    'cs_seminar_hall': 'CS Seminar Hall',
    'is_seminar_hall': 'IS Seminar Hall',
    'ec_seminar_hall': 'EC Seminar Hall',
    'aiml_seminar_hall': 'AIML Seminar Hall',
    'mech_seminar_hall': 'Mechanical Seminar Hall',
    'jubilee_auditorium_1': 'Jubilee Auditorium 1',
    'jubilee_auditorium_2': 'Jubilee Auditorium 2'
};

// Bookings and booking requests storage
const bookings = [];
const bookingRequests = [];

// List of frozen resources
const frozenResources = [];

// Resources array definition
const resources = [
    // Indoor Stadiums - Direct Booking
    {
        id: 'badminton_court_1',
        name: 'Badminton Court 1',
        type: 'indoor',
        category: 'stadium',
        description: 'Professional-grade badminton court with proper lighting and flooring.',
        capacity: 30,
        location: 'Indoor Stadium, Ground Floor',
        facilities: 'Proper lighting, professional flooring, equipment rental',
        requiresApproval: false, // Direct booking
        adminEmails: ['sports.admin@example.com']
    },
    {
        id: 'badminton_court_2',
        name: 'Badminton Court 2',
        type: 'indoor',
        category: 'stadium',
        description: 'Standard badminton court with equipment available on request.',
        capacity: 30,
        location: 'Indoor Stadium, Ground Floor',
        facilities: 'Standard lighting, equipment rental available',
        requiresApproval: false, // Direct booking
        adminEmails: ['sports.admin@example.com']
    },
    {
        id: 'badminton_court_3',
        name: 'Badminton Court 3',
        type: 'indoor',
        category: 'stadium',
        description: 'Tournament-ready badminton court with spectator seating.',
        capacity: 50,
        location: 'Indoor Stadium, First Floor',
        facilities: 'Professional lighting, spectator seating, equipment rental',
        requiresApproval: false, // Direct booking
        adminEmails: ['sports.admin@example.com']
    },
    
    // Open Fields - Direct Booking
    {
        id: 'main_sports_field',
        name: 'Main Sports Field',
        type: 'outdoor',
        category: 'field',
        description: 'Multi-purpose open field suitable for football, cricket, and athletic events.',
        capacity: 100,
        location: 'Central Campus',
        facilities: 'Marked boundaries, equipment storage, drinking water',
        requiresApproval: false, // Direct booking
        adminEmails: ['sports.admin@example.com']
    },
    
    // Seminar Halls - Require Approval
    {
        id: 'cs_seminar_hall',
        name: 'CS Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'Computer Science department seminar hall with advanced presentation equipment.',
        capacity: 120,
        location: 'CS Department, Block A, Second Floor',
        facilities: 'Projector, sound system, podium, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminEmails: ['cs.admin@example.com']
    },
    {
        id: 'is_seminar_hall',
        name: 'IS Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'Information Science department seminar hall with modern AV systems.',
        capacity: 100,
        location: 'IS Department, Block B, First Floor',
        facilities: 'Projector, sound system, podium, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminEmails: ['is.admin@example.com']
    },
    {
        id: 'ec_seminar_hall',
        name: 'EC Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'Well-equipped hall for electronics presentations and demonstrations.',
        capacity: 90,
        location: 'EC Department, Block C, First Floor',
        facilities: 'Projector, sound system, demo table, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminEmails: ['ec.admin@example.com']
    },
    {
        id: 'aiml_seminar_hall',
        name: 'AIML Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'AI & ML department seminar hall with smart presentation capabilities.',
        capacity: 80,
        location: 'AIML Department, Block D, Ground Floor',
        facilities: 'Smart display, sound system, interactive board, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminEmails: ['aiml.admin@example.com']
    },
    {
        id: 'mech_seminar_hall',
        name: 'Mechanical Seminar Hall',
        type: 'indoor',
        category: 'seminar',
        description: 'Mechanical Engineering department seminar hall with demonstration capabilities.',
        capacity: 130,
        location: 'Mechanical Department, Block E, Second Floor',
        facilities: 'Projector, sound system, demo area, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminEmails: ['mech.admin@example.com']
    },
    
    // Auditoriums - Require Approval
    {
        id: 'jubilee_auditorium_1',
        name: 'Jubilee Auditorium 1',
        type: 'indoor',
        category: 'auditorium',
        description: 'Large auditorium suitable for conferences, cultural programs, and major events.',
        capacity: 500,
        location: 'Jubilee Block, Ground Floor',
        facilities: 'Stage, professional sound and lighting, green rooms, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminEmails: ['jubilee.admin@example.com']
    },
    {
        id: 'jubilee_auditorium_2',
        name: 'Jubilee Auditorium 2',
        type: 'indoor',
        category: 'auditorium',
        description: 'Medium-sized auditorium with state-of-the-art acoustics and lighting.',
        capacity: 350,
        location: 'Jubilee Block, First Floor',
        facilities: 'Stage, professional sound and lighting, backstage area, air conditioning',
        requiresApproval: true, // Requires admin approval
        adminEmails: ['jubilee.admin@example.com']
    }
];

// Function to check if a resource requires admin approval
function requiresAdminApproval(resourceId) {
    return RESOURCES_REQUIRING_APPROVAL.includes(resourceId);
}

// Function to find responsible admin for a resource
function findResponsibleAdmin(resourceId) {
    const resourceCode = RESOURCE_CODES[resourceId];
    
    // Find all admins who manage this resource
    const responsibleAdmins = admins.filter(admin => {
        if (admin.manages.includes('all')) return true;
        if (admin.manages.includes(resourceCode)) return true;
        return admin.manages.includes(resourceId);
    });
    
    return responsibleAdmins;
}

// Email notification system
const emailTransporter = nodemailer.createTransport({
    service: 'gmail', // Can be replaced with any SMTP service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-email-password'
    }
});

// Admin notifications storage
const adminNotifications = [];

// Function to add a notification for an admin
function addAdminNotification(adminEmail, type, title, message, resourceId, requestId, sender) {
    const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminEmail,
        type, // 'booking_request', 'request_processed', etc.
        title,
        message,
        resourceId,
        requestId,
        sender,
        timestamp: new Date(),
        read: false
    };
    
    adminNotifications.push(notification);
    return notification;
}

// Email templates
const emailTemplates = {
    bookingConfirmation: (booking) => {
        const resourceName = resourceNameMapping[booking.resourceId] || booking.resourceId;
        return {
            subject: `Booking Confirmation: ${resourceName}`,
            text: `
Hello,

Your booking for ${resourceName} has been confirmed!

Booking Details:
- Date: ${new Date(booking.date).toLocaleDateString()}
- Time: ${booking.time}
- Duration: ${booking.duration} hour(s)
- Purpose: ${booking.purpose}

Thank you for using our booking system.

Regards,
Resource Management Team
            `
        };
    },
    
    bookingRequestSubmitted: (request) => {
        const resourceName = resourceNameMapping[request.resourceId] || request.resourceId;
        return {
            subject: `Booking Request Submitted: ${resourceName}`,
            text: `
Hello,

Your booking request for ${resourceName} has been submitted and is pending approval.

Request Details:
- Date: ${new Date(request.date).toLocaleDateString()}
- Time: ${request.time}
- Duration: ${request.duration} hour(s)
- Purpose: ${request.purpose}

You will receive another notification once your request has been reviewed.

Thank you for using our booking system.

Regards,
Resource Management Team
            `
        };
    },
    
    directBookingNotification: (data) => {
        const resourceName = resourceNameMapping[data.resourceId] || data.resourceId;
        return {
            subject: `New Direct Booking: ${resourceName}`,
            text: `
Hello Administrator,

A new direct booking has been made for your managed resource.

Booking Details:
- Booking ID: ${data.bookingId || 'N/A'}
- Resource: ${resourceName}
- User: ${data.userEmail}
- Date: ${new Date(data.date).toLocaleDateString()}
- Time: ${data.time}
- Duration: ${data.duration} hour(s)
- Purpose: ${data.purpose}
- Status: ${data.status || 'confirmed'}

No action is required, as direct bookings are automatically confirmed.

Regards,
Resource Management System
            `
        };
    },
    
    bookingRequestApproved: (request) => {
        const resourceName = resourceNameMapping[request.resourceId] || request.resourceId;
        return {
            subject: `Booking Request Approved: ${resourceName}`,
            text: `
Hello,

Your booking request for ${resourceName} has been APPROVED!

Booking Details:
- Date: ${new Date(request.date).toLocaleDateString()}
- Time: ${request.time}
- Duration: ${request.duration} hour(s)
- Purpose: ${request.purpose}

${request.adminNotes ? `Admin Notes: ${request.adminNotes}` : ''}

Thank you for using our booking system.

Regards,
Resource Management Team
            `
        };
    },
    
    bookingRequestRejected: (request) => {
        const resourceName = resourceNameMapping[request.resourceId] || request.resourceId;
        return {
            subject: `Booking Request Rejected: ${resourceName}`,
            text: `
Hello,

We regret to inform you that your booking request for ${resourceName} has been REJECTED.

Request Details:
- Date: ${new Date(request.date).toLocaleDateString()}
- Time: ${request.time}
- Duration: ${request.duration} hour(s)
- Purpose: ${request.purpose}

${request.adminNotes ? `Reason for rejection: ${request.adminNotes}` : 'No specific reason was provided.'}

Please contact the administrator if you have any questions.

Regards,
Resource Management Team
            `
        };
    },
    
    newBookingRequestForAdmin: (request, resourceName) => {
        return {
            subject: `New Booking Request: ${resourceName}`,
            text: `
Hello Administrator,

A new booking request requires your attention.

Request Details:
- Request ID: ${request.requestId || 'N/A'}
- Resource: ${resourceName}
- Requested by: ${request.userEmail}
- Date: ${new Date(request.date).toLocaleDateString()}
- Time: ${request.time}
- Duration: ${request.duration} hour(s)
- Purpose: ${request.purpose}
- Status: ${request.status || 'pending'}

Please log in to the admin dashboard to review this request.
You can approve or reject this request at:
http://localhost:3000/admin-dashboard.html

Regards,
Resource Management System
            `
        };
    }
};

// Function to send email notifications
async function sendEmailNotification(to, templateOrSubject, data) {
    try {
        // For development/demo purposes, log the email instead of sending it
        if (process.env.NODE_ENV !== 'production') {
            console.log('------ EMAIL NOTIFICATION ------');
            console.log(`TO: ${to}`);
            
            let subject, content;
            if (typeof templateOrSubject === 'function') {
                // If it's a template function
                const emailContent = templateOrSubject(data);
                subject = emailContent.subject;
                content = emailContent.text;
            } else {
                // If it's just a subject
                subject = templateOrSubject;
                content = JSON.stringify(data, null, 2);
            }
            
            console.log(`SUBJECT: ${subject}`);
            console.log(`CONTENT: ${content}`);
            console.log('--------------------------------');
            return true;
        }
        
        // In production, actually send the email
        let mailOptions;
        
        if (typeof templateOrSubject === 'function') {
            const emailContent = templateOrSubject(data);
            mailOptions = {
                from: process.env.EMAIL_USER || 'resource-booking@example.com',
                to: to,
                subject: emailContent.subject,
                text: emailContent.text
            };
        } else {
            mailOptions = {
                from: process.env.EMAIL_USER || 'resource-booking@example.com',
                to: to,
                subject: templateOrSubject,
                text: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
            };
        }
        
        const info = await emailTransporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email notification:', error);
        return false;
    }
}

// Find admins who manage a specific resource
function findAdminsForResource(resourceId) {
    const resourceCode = RESOURCE_CODES[resourceId];
    
    if (!resourceCode) {
        return [];
    }
    
    return admins.filter(admin => {
        return admin.manages.includes('all') || admin.manages.includes(resourceCode);
    });
}

// Function to notify administrators based on resource-specific rules
function notifyResourceBookingAdmins(resourceId, notificationData) {
    // Get the Super Admin (always notified for all resources)
    const superAdmin = admins.find(admin => admin.role === ADMIN_ROLES.SUPER_ADMIN);
    let adminEmailsToNotify = [];
    
    // Handle specific resource notification rules
    if (resourceId === 'is_seminar_hall') {
        // For IS Seminar Hall: Notify IS Admin and Super Admin
        const isAdmin = admins.find(admin => admin.email === 'is.admin@example.com');
        if (isAdmin) {
            adminEmailsToNotify.push(isAdmin.email);
        }
    } 
    else if (resourceId === 'ec_seminar_hall') {
        // For EC Seminar Hall: Notify EC Admin and Super Admin
        const ecAdmin = admins.find(admin => admin.email === 'ec.admin@example.com');
        if (ecAdmin) {
            adminEmailsToNotify.push(ecAdmin.email);
        }
    }
    else if (resourceId.includes('badminton_court') || resourceId === 'main_sports_field') {
        // For Indoor Stadium or Open Field: Notify Sports Admin and Super Admin
        const sportsAdmin = admins.find(admin => admin.role === ADMIN_ROLES.SPORTS_ADMIN);
        if (sportsAdmin) {
            adminEmailsToNotify.push(sportsAdmin.email);
        }
    }
    else {
        // For all other resources: Use the regular findAdminsForResource function
        const resourceAdmins = findAdminsForResource(resourceId);
        adminEmailsToNotify = resourceAdmins.map(admin => admin.email);
    }
    
    // Always add Super Admin if not already included
    if (superAdmin && !adminEmailsToNotify.includes(superAdmin.email)) {
        adminEmailsToNotify.push(superAdmin.email);
    }
    
    // Send notifications to all identified administrators
    const resourceName = resourceNameMapping[resourceId] || resourceId;
    
    // Use different email templates based on booking type
    const emailSubjectOrTemplate = notificationData.bookingType === 'direct' 
        ? emailTemplates.directBookingNotification 
        : emailTemplates.newBookingRequestForAdmin;
    
    adminEmailsToNotify.forEach(adminEmail => {
        // Send email notification
        sendEmailNotification(adminEmail, emailSubjectOrTemplate, {
            resourceName,
            resourceId,
            ...notificationData
        });
        
        // Create in-app notification for each admin
        if (notificationData.bookingType === 'direct') {
            // Direct booking notification
            addAdminNotification(
                adminEmail,
                'direct_booking',
                'New Direct Booking',
                `A direct booking has been made for ${resourceName} by ${notificationData.userEmail}`,
                resourceId,
                notificationData.bookingId,
                notificationData.userEmail
            );
        } else {
            // Booking request notification
            addAdminNotification(
                adminEmail,
                'booking_request',
                'New Booking Request',
                `A booking request for ${resourceName} requires your attention`,
                resourceId,
                notificationData.requestId,
                notificationData.userEmail
            );
        }
    });
    
    return adminEmailsToNotify;
}

// Routes
app.post('/api/register', async (req, res) => {
    const { email, password, captchaPattern } = req.body;
    
    console.log('Register attempt:', { email, captchaPattern });
    
    // Verify CAPTCHA pattern (very lenient for testing)
    if (!verifyCaptchaPattern(captchaPattern)) {
        return res.status(400).json({ error: 'Invalid CAPTCHA pattern' });
    }

    try {
        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            created_at: new Date(),
            is_admin: false
        };
        
        users.push(newUser);
        console.log('Registered user:', email);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error processing registration' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password, captchaPattern } = req.body;
        
        // Verify CAPTCHA
        if (!verifyCaptchaPattern(captchaPattern)) {
            return res.status(400).json({ error: 'Invalid CAPTCHA' });
        }
        
        console.log('Login attempt:', { email, captchaPattern });
        
        // Check if admin
        const admin = admins.find(admin => admin.email === email);
        
        if (admin) {
            console.log('Admin login attempt for:', email);
            
            // Check admin password (using hardcoded "123456" for testing)
            if (password !== "123456") {
                console.log('Admin login failed: Invalid password for', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Reset session completely to avoid any conflicts
            req.session.regenerate(function(err) {
                if (err) {
                    console.error('Session regeneration error:', err);
                    return res.status(500).json({ error: 'Session error' });
                }
                
                // Set session for admin with complete details
                req.session.adminId = admin.id;
                req.session.adminEmail = admin.email;
                req.session.role = admin.role;
                req.session.manages = admin.manages;
                req.session.isAdmin = true;
                req.session.userType = 'admin';
                
                console.log('Admin login successful:', email);
                console.log('Admin session set:', {
                    adminId: req.session.adminId,
                    adminEmail: req.session.adminEmail,
                    role: req.session.role,
                    isAdmin: req.session.isAdmin
                });
                
                return res.json({ 
                    message: 'Admin login successful', 
                    adminId: admin.id,
                    email: admin.email,
                    role: admin.role,
                    manages: admin.manages,
                    redirectTo: '/admin-dashboard.html',
                    userType: 'admin'
                });
            });
            return; // Important to stop execution here
        }

        // If not admin, check regular users
        const user = users.find(user => user.email === email);
        
        // if (!user) {
        //     console.log('Login failed: User not found -', email);
        //     return res.status(401).json({ error: 'Invalid credentials' });
        // }

        // For testing, allow password "123456" for all users
        const validPassword = password === "123456" || await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            console.log('Login failed: Invalid password -', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset session completely to avoid any conflicts
        req.session.regenerate(function(err) {
            if (err) {
                console.error('Session regeneration error:', err);
                return res.status(500).json({ error: 'Session error' });
            }
            
            // Set session for user
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            req.session.isAdmin = false;
            req.session.userType = 'user';
            
            console.log('User login successful:', email);
            console.log('User session set:', {
                userId: req.session.userId,
                userEmail: req.session.userEmail,
                isAdmin: req.session.isAdmin
            });
            
            res.json({ 
                message: 'Login successful', 
                userId: user.id,
                email: user.email,
                redirectTo: '/dashboard.html',
                userType: 'user'
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error during login' });
    }
});

// Admin-specific login route
app.post('/api/admin-login', async (req, res) => {
    try {
        const { email, password, captchaPattern } = req.body;
        
        // Debug request data
        console.log('Admin login attempt with data:', { 
            email, 
            passwordProvided: !!password,
            captchaProvided: !!captchaPattern,
            captchaLength: captchaPattern ? captchaPattern.length : 0
        });
        
        // Verify CAPTCHA
        if (!verifyCaptchaPattern(captchaPattern)) {
            console.log('Admin login failed: Invalid CAPTCHA for', email);
            return res.status(400).json({ error: 'Invalid CAPTCHA' });
        }
        
        console.log('Admin login attempt for:', email);
        
        // Find admin account
        const admin = admins.find(admin => admin.email === email);
        
        if (!admin) {
            console.log('Admin login failed: Admin not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check password (using hardcoded "123456" for testing)
        if (password !== "123456") {
            console.log('Admin login failed: Invalid password for', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Important: Regenerate session to prevent session fixation
        req.session.regenerate(function(err) {
            if (err) {
                console.error('Session regeneration error during admin login:', err);
                return res.status(500).json({ error: 'Session error, please try again' });
            }
            
            // Set admin session with all required data
            req.session.adminId = admin.id;
            req.session.adminEmail = admin.email;
            req.session.role = admin.role;
            req.session.manages = admin.manages;
            req.session.isAdmin = true;
            req.session.userType = 'admin';
            req.session.createdAt = new Date().toISOString();
            
            // Save the session explicitly
            req.session.save(function(err) {
                if (err) {
                    console.error('Session save error during admin login:', err);
                    return res.status(500).json({ error: 'Session error, please try again' });
                }
                
                console.log('Admin login successful:', email);
                console.log('Admin session set:', {
                    adminId: req.session.adminId,
                    adminEmail: req.session.adminEmail,
                    role: req.session.role,
                    isAdmin: req.session.isAdmin,
                    userType: req.session.userType
                });
                
                // Return success with admin data
                res.json({ 
                    message: 'Admin login successful', 
                    adminId: admin.id,
                    email: admin.email,
                    role: admin.role,
                    manages: admin.manages,
                    redirectTo: '/admin-dashboard.html',
                    isAdmin: true,
                    userType: 'admin'
                });
            });
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Error during admin login, please try again' });
    }
});

// CAPTCHA verification function - very lenient for testing
function verifyCaptchaPattern(pattern) {
    console.log('Verifying CAPTCHA pattern:', pattern);
    
    // Just check if the pattern exists and has at least one node
    if (!Array.isArray(pattern) || pattern.length < 1) {
        console.log('CAPTCHA verification failed: Invalid pattern');
        return false;
    }

    console.log('CAPTCHA verification passed');
    return true;
}

// Protected route for admin profile
app.get('/api/admin-profile', (req, res) => {
    console.log('Admin profile request received');
    
    // Debug session state
    console.log('Session data:', {
        cookies: req.headers.cookie,
        sessionID: req.sessionID,
        hasSession: !!req.session,
        adminId: req.session ? req.session.adminId : null,
        adminEmail: req.session ? req.session.adminEmail : null,
        role: req.session ? req.session.role : null,
        userType: req.session ? req.session.userType : null,
        isAdmin: req.session ? req.session.isAdmin : null
    });
    
    // Check if session exists
    if (!req.session) {
        console.log('Admin profile request rejected: No session object');
        return res.status(401).json({ 
            error: 'Session not found',
            authenticated: false,
            sessionExists: false
        });
    }
    
    // Check if admin is authenticated via session - FIXED CONDITION
    // The original condition was checking userType which might not be set correctly
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin profile request rejected: No valid admin session', {
            adminId: req.session.adminId,
            isAdmin: req.session.isAdmin,
            userType: req.session.userType
        });
        return res.status(401).json({ 
            error: 'Not authenticated as admin',
            authenticated: false,
            sessionExists: true,
            userType: req.session.userType
        });
    }
    
    // Find the admin in our data
    const admin = admins.find(admin => admin.id === req.session.adminId);
    
    if (!admin) {
        console.log('Admin profile request rejected: Admin not found in database for ID:', req.session.adminId);
        return res.status(404).json({ 
            error: 'Admin not found',
            authenticated: false,
            sessionExists: true,
            adminIdExists: true
        });
    }
    
    // Don't send the password
    const { password, ...adminInfo } = admin;
    
    console.log('Admin profile request successful for admin:', admin.email);
    
    res.json({
        ...adminInfo,
        authenticated: true,
        sessionValid: true,
        timestamp: new Date().toISOString()
    });
});

// Protected route for user profile
app.get('/api/profile', (req, res) => {
    console.log('User profile request received');
    
    // Debug session state
    console.log('Session data:', {
        cookies: req.headers.cookie,
        sessionID: req.sessionID,
        hasSession: !!req.session,
        userId: req.session ? req.session.userId : null,
        userEmail: req.session ? req.session.userEmail : null,
        userType: req.session ? req.session.userType : null
    });
    
    // Check if session exists
    if (!req.session) {
        console.log('User profile request rejected: No session object');
        return res.status(401).json({ 
            error: 'Session not found',
            authenticated: false,
            sessionExists: false
        });
    }
    
    // Check if user is authenticated via session
    if (!req.session.userId || req.session.userType !== 'user') {
        console.log('User profile request rejected: No valid user session');
        return res.status(401).json({ 
            error: 'Not authenticated as user',
            authenticated: false,
            sessionExists: true,
            userType: req.session.userType
        });
    }
    
    // Find the user in our data
    const user = users.find(user => user.id === req.session.userId);
    
    if (!user) {
        console.log('User profile request rejected: User not found in database for ID:', req.session.userId);
        return res.status(404).json({ 
            error: 'User not found',
            authenticated: false,
            sessionExists: true,
            userIdExists: true
        });
    }
    
    // Don't send the password
    const { password, ...userInfo } = user;
    
    console.log('User profile request successful for user:', user.email);
    
    res.json({
        ...userInfo,
        authenticated: true,
        sessionValid: true,
        timestamp: new Date().toISOString()
    });
});

// Get resources managed by the admin
app.get('/api/admin/resources', (req, res) => {
    if (!req.session.adminId) {
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const admin = admins.find(admin => admin.id === req.session.adminId);
    
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    
    // For super_admin, return all resources
    if (admin.role === ADMIN_ROLES.SUPER_ADMIN) {
        return res.json(Object.keys(RESOURCE_CODES));
    }
    
    // Convert admin's managed resources to actual resource names
    const managedResources = [];
    for (const resourceCode of admin.manages) {
        if (resourceCode === 'all') {
            return res.json(Object.keys(RESOURCE_CODES));
        }
        
        // Add all resources that map to this resource code
        for (const [resource, code] of Object.entries(RESOURCE_CODES)) {
            if (code === resourceCode) {
                managedResources.push(resource);
            }
        }
    }
    
    res.json(managedResources);
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

// Add POST endpoint for logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Show available users and admins in console for testing
console.log('Available test users:');
users.forEach(user => {
    console.log(`- Email: ${user.email}, Password: 123456 (for test@example.com)`);
});

console.log('\nAvailable test admins:');
admins.forEach(admin => {
    console.log(`- Email: ${admin.email}, Password: 123456, Role: ${admin.role}, Manages: ${admin.manages.join(', ')}`);
});

// Utility functions for booking validation
function validateBookingRules(resourceId, date, time) {
    // Parse date and time
    const bookingDate = new Date(date);
    const bookingHour = parseInt(time.split(':')[0], 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    
    // Get resource category
    let resourceCategory = '';
    if (resourceId.includes('badminton') || Object.keys(RESOURCE_CODES).some(key => key === resourceId && RESOURCE_CODES[key] === 'indoor_stadium')) {
        resourceCategory = 'stadium';
    } else if (resourceId.includes('field') || Object.keys(RESOURCE_CODES).some(key => key === resourceId && RESOURCE_CODES[key] === 'open_field')) {
        resourceCategory = 'field';
    } else if (resourceId.includes('hall') || resourceId.includes('seminar')) {
        resourceCategory = 'seminar';
    }
    
    // Check date and time rules
    const isToday = bookingDate.getTime() === today.getTime();
    const isSunday = bookingDate.getDay() === 0;
    
    if (resourceCategory === 'stadium') {
        // Indoor stadium: bookable today only, 2 PM to 8 PM, no Sundays
        if (!isToday) {
            return { valid: false, message: 'Indoor stadium can only be booked for today.' };
        }
        if (isSunday) {
            return { valid: false, message: 'Indoor stadium is not available on Sundays.' };
        }
        if (bookingHour < 14 || bookingHour >= 20) {
            return { valid: false, message: 'Indoor stadium is only available from 2 PM to 8 PM.' };
        }
    } else if (resourceCategory === 'field') {
        // Open field: bookable today only, 5 AM onwards
        if (!isToday) {
            return { valid: false, message: 'Open field can only be booked for today.' };
        }
        if (bookingHour < 5) {
            return { valid: false, message: 'Open field is only available from 5 AM onwards.' };
        }
    } else if (resourceCategory === 'seminar') {
        // Seminar halls: bookable up to 10 days ahead
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 10);
        if (bookingDate < today || bookingDate > maxDate) {
            return { valid: false, message: 'Seminar halls can only be booked up to 10 days in advance.' };
        }
        if (bookingHour < 8 || bookingHour >= 18) {
            return { valid: false, message: 'Seminar halls are only available from 8 AM to 6 PM.' };
        }
    }
    
    return { valid: true };
}

// Check if a resource is frozen
function isResourceFrozen(resourceId) {
    return frozenResources.some(item => item.resourceId === resourceId);
}

// Check if admin has permission to manage a resource
function adminCanManageResource(admin, resourceId) {
    // Super admin can manage all resources
    if (admin.role === ADMIN_ROLES.SUPER_ADMIN || admin.manages.includes('all')) {
        return true;
    }
    
    // Get the resource code for the given resourceId
    const resourceCode = RESOURCE_CODES[resourceId];
    
    // Check if admin manages this resource code
    return admin.manages.includes(resourceCode);
}

// Admin endpoint to get all bookings for resources they manage
app.get('/api/admin/bookings', (req, res) => {
    if (!req.session.adminId) {
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const admin = admins.find(admin => admin.id === req.session.adminId);
    
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Filter bookings based on admin's managed resources
    let adminBookings = [];
    
    if (admin.role === ADMIN_ROLES.SUPER_ADMIN || admin.manages.includes('all')) {
        // Super admin can see all bookings
        adminBookings = bookings;
    } else {
        // Filter bookings for resources this admin manages
        adminBookings = bookings.filter(booking => {
            const resourceCode = RESOURCE_CODES[booking.resourceId];
            return admin.manages.includes(resourceCode);
        });
    }
    
    res.json(adminBookings);
});

// Admin endpoint to freeze/unfreeze a resource
app.post('/api/admin/resources/freeze', (req, res) => {
    const { resourceId, freeze, reason } = req.body;
    
    if (!resourceId || freeze === undefined) {
        return res.status(400).json({ error: 'Resource ID and freeze status are required' });
    }
    
    if (!req.session.adminId) {
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const admin = admins.find(admin => admin.id === req.session.adminId);
    
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Check if admin can manage this resource
    if (!adminCanManageResource(admin, resourceId)) {
        return res.status(403).json({ error: 'You do not have permission to manage this resource' });
    }
    
    // Check if resource exists
    if (!RESOURCE_CODES[resourceId]) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Handle freeze/unfreeze
    const existingIndex = frozenResources.findIndex(item => item.resourceId === resourceId);
    
    if (freeze) {
        // Freeze the resource if not already frozen
        if (existingIndex === -1) {
            frozenResources.push({
                resourceId,
                reason: reason || 'Temporarily unavailable',
                frozenBy: admin.email,
                frozenAt: new Date().toISOString()
            });
            console.log(`Resource ${resourceId} frozen by ${admin.email}`);
        } else {
            // Update existing freeze reason
            frozenResources[existingIndex].reason = reason || 'Temporarily unavailable';
            frozenResources[existingIndex].frozenBy = admin.email;
            frozenResources[existingIndex].frozenAt = new Date().toISOString();
            console.log(`Resource ${resourceId} freeze updated by ${admin.email}`);
        }
    } else {
        // Unfreeze the resource
        if (existingIndex !== -1) {
            frozenResources.splice(existingIndex, 1);
            console.log(`Resource ${resourceId} unfrozen by ${admin.email}`);
        }
    }
    
    res.json({ 
        message: freeze ? 'Resource frozen successfully' : 'Resource unfrozen successfully',
        resourceId
    });
});

// Get frozen resources
app.get('/api/resources/frozen', (req, res) => {
    res.json(frozenResources);
});

// Admin endpoint to remove a booking
app.delete('/api/admin/bookings/:bookingId', (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    if (!req.session.adminId) {
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const admin = admins.find(admin => admin.id === req.session.adminId);
    
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Find the booking
    const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
    
    if (bookingIndex === -1) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookings[bookingIndex];
    
    // Check if admin can manage this resource
    if (!adminCanManageResource(admin, booking.resourceId)) {
        return res.status(403).json({ error: 'You do not have permission to manage this booking' });
    }
    
    // Remove the booking
    const removedBooking = bookings.splice(bookingIndex, 1)[0];
    
    console.log(`Booking ${bookingId} removed by admin ${admin.email}. Reason: ${reason || 'Not specified'}`);
    
    // Optional: Notify the user (in a real app, you would send an email)
    
    res.json({ 
        message: 'Booking removed successfully',
        booking: removedBooking
    });
});

// Direct booking endpoint
app.post('/api/bookings', (req, res) => {
    const { userEmail, resourceId, date, time, duration, purpose, attendees, captchaPattern, booking_date, time_slot } = req.body;
    
    // Basic validation
    if (!userEmail || !resourceId || !date || !time || !duration || !purpose || !attendees || !captchaPattern) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // CAPTCHA verification
    console.log(`Verifying CAPTCHA pattern: ${captchaPattern}`);
    // Simple CAPTCHA check - in a real app, this would be more sophisticated
    if (!captchaPattern || captchaPattern.length < 2) {
        return res.status(400).json({ error: 'CAPTCHA verification failed' });
    }
    
    // Check if resource requires approval
    if (requiresAdminApproval(resourceId)) {
        return res.status(400).json({ 
            error: 'This resource requires admin approval',
            requiresApproval: true
        });
    }
    
    // Check if resource is frozen
    if (isResourceFrozen(resourceId)) {
        return res.status(400).json({ error: 'Resource is currently frozen and unavailable for booking' });
    }
    
    // Generate unique ID
    const bookingId = `BK${Date.now()}`;
    
    // Create booking
    const booking = {
        bookingId,
        userEmail,
        resourceId,
        date,
        time,
        duration,
        purpose,
        attendees,
        status: 'confirmed',
        createdAt: new Date(),
        booking_date: booking_date || date, // Use booking_date if provided, fall back to date
        time_slot: time_slot || time     // Use time_slot if provided, fall back to time
    };
    
    // Log booking data for debugging
    console.log('Creating booking with data:', {
        bookingId: booking.bookingId,
        userEmail: booking.userEmail,
        resourceId: booking.resourceId,
        date: booking.date,
        time: booking.time,
        booking_date: booking.booking_date,
        time_slot: booking.time_slot
    });
    
    // Save booking
    bookings.push(booking);
    
    // Send confirmation email to the user
    sendEmailNotification(userEmail, "Booking Confirmation", booking);
    
    // Always notify admins about direct bookings for indoor stadium and open field resources
    if (resourceId.includes('badminton_court') || resourceId === 'main_sports_field') {
        const resourceName = resourceNameMapping[resourceId] || resourceId;
        notifyResourceBookingAdmins(resourceId, {
            bookingId: booking.bookingId,
            userEmail,
            resourceId,
            date,
            time,
            duration,
            purpose,
            bookingType: 'direct',
            status: 'confirmed',
            attendees
        });
    }
    
    // Respond with booking details
    res.status(201).json({ 
        message: 'Booking confirmed',
        booking
    });
});

// Booking request endpoint (for resources requiring approval)
app.post('/api/booking-requests', (req, res) => {
    const { userEmail, resourceId, date, time, duration, purpose, attendees, department, event, captchaPattern, booking_date, time_slot } = req.body;
    
    // Basic validation
    if (!userEmail || !resourceId || !date || !time || !duration || !purpose || !attendees || !captchaPattern) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    // CAPTCHA verification
    console.log(`Verifying CAPTCHA pattern: ${captchaPattern}`);
    // Simple CAPTCHA check - in a real app, this would be more sophisticated
    if (!captchaPattern || captchaPattern.length < 2) {
        return res.status(400).json({ error: 'CAPTCHA verification failed' });
    }
    
    // Check if the resource requires approval
    if (!requiresAdminApproval(resourceId)) {
        return res.status(400).json({ 
            error: 'This resource is available for direct booking',
            directBooking: true
        });
    }
    
    // Generate unique ID
    const requestId = `RQ${Date.now()}`;
    
    // Create booking request
    const request = {
        requestId,
        userEmail,
        resourceId,
        date,
        time,
        duration,
        purpose,
        attendees,
        department,
        event,
        status: 'pending',
        createdAt: new Date(),
        booking_date: booking_date || date, // Use booking_date if provided, fall back to date
        time_slot: time_slot || time     // Use time_slot if provided, fall back to time
    };
    
    // Log request data for debugging
    console.log('Creating booking request with data:', {
        requestId: request.requestId,
        userEmail: request.userEmail,
        resourceId: request.resourceId,
        date: request.date,
        time: request.time,
        booking_date: request.booking_date,
        time_slot: request.time_slot
    });
    
    // Special handling for Jubilee Auditoriums
    if (resourceId === 'jubilee_auditorium_1' || resourceId === 'jubilee_auditorium_2') {
        // Additional validation for auditorium bookings
        if (!department || !event) {
            return res.status(400).json({
                error: 'Department and event details are required for auditorium bookings'
            });
        }
        
        // Add specific fields for auditorium booking requests
        request.eventType = req.body.eventType || 'Not specified';
        request.expectedAttendees = req.body.expectedAttendees || attendees;
        request.technicalRequirements = req.body.technicalRequirements || 'None';
    }
    
    // Save request
    bookingRequests.push(request);
    
    // Use the new notification system to notify appropriate administrators
    notifyResourceBookingAdmins(resourceId, {
        requestId: request.requestId,
        userEmail,
        date,
        time,
        duration,
        purpose,
        status: 'pending',
        bookingType: 'request'
    });
    
    // Send confirmation email to the user
    sendEmailNotification(userEmail, "Booking Request Submitted", request);
    
    // Respond with request details
    res.status(201).json({ 
        message: 'Booking request submitted for approval',
        request 
    });
});

// Admin endpoint to get booking requests
app.get('/api/admin/booking-requests', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for /api/admin/booking-requests');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    console.log(`Admin ${req.session.adminEmail} fetching booking requests`);
    
    // Get admin from session
    const admin = admins.find(admin => admin.id === req.session.adminId);
    if (!admin) {
        console.log('Admin not found for /api/admin/booking-requests');
        return res.status(404).json({ error: 'Admin not found' });
    }
    
    let filteredRequests = [];
    
    // If super admin, show all requests
    if (admin.role === 'super_admin' || admin.manages.includes('all')) {
        filteredRequests = [...bookingRequests];
    } else {
        // Filter requests based on admin's managed resources
        filteredRequests = bookingRequests.filter(request => {
            // Check if this admin manages the resource
            const resourceCode = RESOURCE_CODES[request.resourceId];
            return admin.manages.includes(resourceCode) || admin.manages.includes(request.resourceId);
        });
    }
    
    // Enhance requests with resource and user information
    const enhancedRequests = filteredRequests.map(request => {
        // Find corresponding resource
        const resource = resources.find(r => r.id === request.resourceId);
        
        return {
            ...request,
            resourceName: resource ? resource.name : request.resourceId,
            resourceDetails: resource ? {
                name: resource.name,
                category: resource.category,
                location: resource.location,
                capacity: resource.capacity
            } : null
        };
    });
    
    console.log(`Found ${enhancedRequests.length} booking requests for admin ${admin.email}`);
    res.json(enhancedRequests);
});

// Admin endpoint to get notifications
app.get('/api/admin/notifications', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for notifications');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const adminEmail = req.session.adminEmail;
    console.log(`Admin ${adminEmail} fetching notifications`);
    
    // Find notifications for this admin
    const adminSpecificNotifications = adminNotifications.filter(
        notification => notification.adminEmail === adminEmail
    ).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    
    console.log(`Found ${adminSpecificNotifications.length} notifications for admin ${adminEmail}`);
    res.json(adminSpecificNotifications);
});

// Admin endpoint to mark notification(s) as read
app.post('/api/admin/notifications/mark-read', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for marking notifications');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const adminEmail = req.session.adminEmail;
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({ error: 'Notification IDs must be provided as an array' });
    }
    
    console.log(`Admin ${adminEmail} marking notifications as read: ${notificationIds.join(', ')}`);
    
    // Update notification read status
    let updatedCount = 0;
    
    notificationIds.forEach(id => {
        const notification = adminNotifications.find(
            n => n.id === id && n.adminEmail === adminEmail
        );
        
        if (notification) {
            notification.read = true;
            updatedCount++;
        }
    });
    
    console.log(`Marked ${updatedCount} notifications as read for admin ${adminEmail}`);
    res.json({ success: true, count: updatedCount });
});

// Admin endpoint to approve a booking request
app.post('/api/admin/booking-requests/:requestId/approve', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for approve request');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const requestId = req.params.requestId;
    const adminNotes = req.body.adminNotes || '';
    const adminEmail = req.session.adminEmail;
    
    console.log(`Admin ${adminEmail} is approving booking request ${requestId}`);
    
    // Find the request
    const requestIndex = bookingRequests.findIndex(req => req.requestId === requestId);
    
    if (requestIndex === -1) {
        return res.status(404).json({ error: 'Booking request not found' });
    }
    
    // Get the request
    const request = bookingRequests[requestIndex];
    
    // Check if admin can manage this resource
    const admin = admins.find(admin => admin.id === req.session.adminId);
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Check authorization: admin must be super_admin or specifically manage this resource
    if (admin.role !== 'super_admin' && !admin.manages.includes('all')) {
        // For specific resource rules
        if (request.resourceId === 'is_seminar_hall' && admin.email !== 'is.admin@example.com' && !admin.manages.includes('is_seminar_hall')) {
            return res.status(403).json({ error: 'You do not have permission to manage IS Seminar Hall bookings' });
        }
        else if (request.resourceId === 'ec_seminar_hall' && admin.email !== 'ec.admin@example.com' && !admin.manages.includes('ec_seminar_hall')) {
            return res.status(403).json({ error: 'You do not have permission to manage EC Seminar Hall bookings' });
        }
        else if ((request.resourceId.includes('badminton_court') || request.resourceId === 'main_sports_field') 
                && admin.role !== 'sports_admin' && !admin.manages.includes(request.resourceId)) {
            return res.status(403).json({ error: 'You do not have permission to manage sport facilities bookings' });
        }
        else if (!admin.manages.includes(request.resourceId)) {
            // General case for other resources
            const resourceCode = RESOURCE_CODES[request.resourceId];
            if (!admin.manages.includes(resourceCode)) {
                return res.status(403).json({ error: 'You do not have permission to manage this resource' });
            }
        }
    }
    
    // Check if request is already processed
    if (request.status !== 'pending') {
        return res.status(400).json({ 
            error: `Request has already been ${request.status}`,
            request 
        });
    }
    
    // Update request status
    request.status = 'approved';
    request.adminNotes = adminNotes;
    request.processedBy = adminEmail;
    request.processedAt = new Date().toISOString();
    
    console.log(`Booking request ${requestId} approved by ${adminEmail}`);
    
    // Create a confirmed booking
    const bookingRef = 'BK' + Date.now();
    
    const newBooking = {
        bookingId: bookingRef,
        resourceId: request.resourceId,
        date: request.date,
        time: request.time,
        duration: request.duration,
        purpose: request.purpose,
        attendees: request.attendees,
        department: request.department,
        faculty: request.faculty,
        userEmail: request.userEmail,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        requestId: request.requestId,
        booking_date: request.booking_date || request.date,
        time_slot: request.time_slot || request.time
    };
    
    bookings.push(newBooking);
    console.log('New confirmed booking created from request:', bookingRef);
    
    // Find responsible admins for this resource
    const resourceAdmins = findAdminsForResource(request.resourceId);
    const resourceName = resourceNameMapping[request.resourceId] || request.resourceId;
    
    // Notify all relevant admins about the approval
    resourceAdmins.forEach(resourceAdmin => {
        // Don't notify the admin who took the action
        if (resourceAdmin.email !== adminEmail) {
            // Create notification for other admins
            addAdminNotification(
                resourceAdmin.email,
                'request_approved',
                'Booking Request Approved',
                `Booking request for ${resourceName} has been approved by ${adminEmail}`,
                request.resourceId,
                request.requestId,
                adminEmail
            );
        }
    });
    
    // Send approval notification to user
    sendEmailNotification(
        request.userEmail, 
        "Booking Request Approved", 
        {
            resourceName: resourceName,
            date: request.date,
            time: request.time,
            duration: request.duration,
            purpose: request.purpose,
            adminNotes: adminNotes || "No additional notes provided."
        }
    );
    
    res.json({ 
        message: `Booking request approved successfully`,
        request,
        booking: newBooking
    });
});

// Admin endpoint to reject a booking request
app.post('/api/admin/booking-requests/:requestId/reject', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for reject request');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const requestId = req.params.requestId;
    const adminNotes = req.body.adminNotes || '';
    const adminEmail = req.session.adminEmail;
    
    console.log(`Admin ${adminEmail} is rejecting booking request ${requestId}`);
    
    // Find the request
    const requestIndex = bookingRequests.findIndex(req => req.requestId === requestId);
    
    if (requestIndex === -1) {
        return res.status(404).json({ error: 'Booking request not found' });
    }
    
    // Get the request
    const request = bookingRequests[requestIndex];
    
    // Check if admin can manage this resource
    const admin = admins.find(admin => admin.id === req.session.adminId);
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }

    // Check authorization: admin must be super_admin or specifically manage this resource
    if (admin.role !== 'super_admin' && !admin.manages.includes('all')) {
        // For specific resource rules
        if (request.resourceId === 'is_seminar_hall' && admin.email !== 'is.admin@example.com' && !admin.manages.includes('is_seminar_hall')) {
            return res.status(403).json({ error: 'You do not have permission to manage IS Seminar Hall bookings' });
        }
        else if (request.resourceId === 'ec_seminar_hall' && admin.email !== 'ec.admin@example.com' && !admin.manages.includes('ec_seminar_hall')) {
            return res.status(403).json({ error: 'You do not have permission to manage EC Seminar Hall bookings' });
        }
        else if ((request.resourceId.includes('badminton_court') || request.resourceId === 'main_sports_field') 
                && admin.role !== 'sports_admin' && !admin.manages.includes(request.resourceId)) {
            return res.status(403).json({ error: 'You do not have permission to manage sport facilities bookings' });
        }
        else if (!admin.manages.includes(request.resourceId)) {
            // General case for other resources
            const resourceCode = RESOURCE_CODES[request.resourceId];
            if (!admin.manages.includes(resourceCode)) {
                return res.status(403).json({ error: 'You do not have permission to manage this resource' });
            }
        }
    }
    
    // Check if request is already processed
    if (request.status !== 'pending') {
        return res.status(400).json({ 
            error: `Request has already been ${request.status}`,
            request 
        });
    }
    
    // Update request status
    request.status = 'rejected';
    request.adminNotes = adminNotes;
    request.processedBy = adminEmail;
    request.processedAt = new Date().toISOString();
    
    console.log(`Booking request ${requestId} rejected by ${adminEmail}`);
    
    // Find responsible admins for this resource
    const resourceAdmins = findAdminsForResource(request.resourceId);
    const resourceName = resourceNameMapping[request.resourceId] || request.resourceId;
    
    // Notify all relevant admins about the rejection
    resourceAdmins.forEach(resourceAdmin => {
        // Don't notify the admin who took the action
        if (resourceAdmin.email !== adminEmail) {
            // Create notification for other admins
            addAdminNotification(
                resourceAdmin.email,
                'request_rejected',
                'Booking Request Rejected',
                `Booking request for ${resourceName} has been rejected by ${adminEmail}`,
                request.resourceId,
                request.requestId,
                adminEmail
            );
        }
    });
    
    // Send rejection notification to user
    sendEmailNotification(
        request.userEmail, 
        "Booking Request Rejected", 
        {
            resourceName: resourceName,
            date: request.date,
            time: request.time,
            duration: request.duration,
            purpose: request.purpose,
            adminNotes: adminNotes || "No specific reason was provided."
        }
    );
    
    res.json({ 
        message: `Booking request rejected successfully`,
        request 
    });
});

// Get user's bookings
app.get('/api/user/bookings', (req, res) => {
    // Check if user is logged in
    if (!req.session.userId) {
        console.log('User not authenticated for /api/user/bookings');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user from session
    const user = users.find(user => user.id === req.session.userId);
    if (!user) {
        console.log('User not found for /api/user/bookings');
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Use email from query parameter if provided, otherwise use session user's email
    const email = req.query.email || user.email;
    
    console.log(`Fetching bookings for user: ${email}`);
    
    // Get user's confirmed bookings
    const userBookings = bookings.filter(booking => booking.userEmail === email);
    console.log(`Found ${userBookings.length} bookings for user ${email}`);
    
    // Enhance bookings with resource information
    const enhancedBookings = userBookings.map(booking => {
        // Find corresponding resource
        const resource = resources.find(r => r.id === booking.resourceId);
        
        return {
            ...booking,
            resourceDetails: resource ? {
                name: resource.name,
                category: resource.category,
                location: resource.location,
                capacity: resource.capacity
            } : null
        };
    });
    
    res.json(enhancedBookings);
});

// Get user's booking requests
app.get('/api/user/booking-requests', (req, res) => {
    // Check if user is logged in
    if (!req.session.userId) {
        console.log('User not authenticated for /api/user/booking-requests');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user from session
    const user = users.find(user => user.id === req.session.userId);
    if (!user) {
        console.log('User not found for /api/user/booking-requests');
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Use email from query parameter if provided, otherwise use session user's email
    const email = req.query.email || user.email;
    
    console.log(`Fetching booking requests for user: ${email}`);
    
    // Get user's booking requests
    const userRequests = bookingRequests.filter(req => req.userEmail === email);
    console.log(`Found ${userRequests.length} booking requests for user ${email}`);
    
    // Enhance requests with resource information
    const enhancedRequests = userRequests.map(request => {
        // Find corresponding resource
        const resource = resources.find(r => r.id === request.resourceId);
        
        return {
            ...request,
            resourceDetails: resource ? {
                name: resource.name,
                category: resource.category,
                location: resource.location,
                capacity: resource.capacity
            } : null
        };
    });
    
    res.json(enhancedRequests);
});

// Cancel booking
app.post('/api/bookings/cancel', (req, res) => {
    const { bookingId, userEmail } = req.body;
    
    // Find the booking
    const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
    
    if (bookingIndex === -1) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if the user owns the booking
    if (bookings[bookingIndex].userEmail !== userEmail) {
        return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }
    
    // Remove the booking
    bookings.splice(bookingIndex, 1);
    console.log(`Booking ${bookingId} canceled by ${userEmail}`);
    
    res.json({ message: 'Booking canceled successfully' });
});

// DELETE endpoint for canceling a booking
app.delete('/api/user/bookings/:bookingId', (req, res) => {
    const { bookingId } = req.params;
    
    // Check if user is logged in
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user from session
    const user = users.find(user => user.id === req.session.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the booking
    const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
    
    if (bookingIndex === -1) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if the user owns the booking
    if (bookings[bookingIndex].userEmail !== user.email) {
        return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }
    
    // Remove the booking
    const canceledBooking = bookings.splice(bookingIndex, 1)[0];
    console.log(`Booking ${bookingId} canceled by ${user.email}`);
    
    res.json({ 
        message: 'Booking canceled successfully',
        booking: canceledBooking
    });
});

// Cancel booking request
app.post('/api/booking-requests/cancel', (req, res) => {
    const { requestId, userEmail } = req.body;
    
    // Find the request
    const requestIndex = bookingRequests.findIndex(req => req.requestId === requestId);
    
    if (requestIndex === -1) {
        return res.status(404).json({ error: 'Booking request not found' });
    }
    
    // Check if the user owns the request
    if (bookingRequests[requestIndex].userEmail !== userEmail) {
        return res.status(403).json({ error: 'Unauthorized to cancel this request' });
    }
    
    // Check if the request is already processed (approved or rejected)
    if (bookingRequests[requestIndex].status !== 'pending') {
        return res.status(400).json({ error: 'Cannot cancel a request that has already been processed' });
    }
    
    // Mark the request as cancelled instead of removing it
    bookingRequests[requestIndex].status = 'cancelled';
    bookingRequests[requestIndex].cancelledAt = new Date().toISOString();
    bookingRequests[requestIndex].cancelledBy = userEmail;
    
    console.log(`Booking request ${requestId} canceled by ${userEmail}`);
    
    res.json({ message: 'Booking request canceled successfully' });
});

// DELETE endpoint for canceling a booking request
app.delete('/api/user/booking-requests/:requestId', (req, res) => {
    const { requestId } = req.params;
    
    // Check if user is logged in
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user from session
    const user = users.find(user => user.id === req.session.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the request
    const requestIndex = bookingRequests.findIndex(req => req.requestId === requestId);
    
    if (requestIndex === -1) {
        return res.status(404).json({ error: 'Booking request not found' });
    }
    
    // Check if the user owns the request
    if (bookingRequests[requestIndex].userEmail !== user.email) {
        return res.status(403).json({ error: 'Unauthorized to cancel this request' });
    }
    
    // Check if the request is already processed (approved or rejected)
    if (bookingRequests[requestIndex].status !== 'pending') {
        return res.status(400).json({ error: 'Cannot cancel a request that has already been processed' });
    }
    
    // Mark the request as cancelled
    bookingRequests[requestIndex].status = 'cancelled';
    bookingRequests[requestIndex].cancelledAt = new Date().toISOString();
    bookingRequests[requestIndex].cancelledBy = user.email;
    
    console.log(`Booking request ${requestId} canceled by ${user.email}`);
    
    res.json({ 
        message: 'Booking request canceled successfully',
        request: bookingRequests[requestIndex]
    });
});

// Get availability API
app.get('/api/availability', (req, res) => {
    const { date, resourceId } = req.query;
    
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }
    
    // Get all bookings for the specified date
    const bookingsForDate = bookings.filter(booking => 
        booking.booking_date === date || booking.date === date
    );
    
    // Get all pending requests for the specified date
    const requestsForDate = bookingRequests.filter(request => 
        request.booking_date === date || request.date === date
    );
    
    // If resourceId is specified, filter to only that resource
    const result = {
        bookings: resourceId 
            ? bookingsForDate.filter(booking => booking.resourceId === resourceId)
            : bookingsForDate,
        requests: resourceId
            ? requestsForDate.filter(request => request.resourceId === resourceId)
            : requestsForDate,
        rules: []
    };
    
    // Add resource-specific rules to the response
    if (resourceId) {
        let resourceCategory = '';
        const resource = resources.find(r => r.id === resourceId);
        
        if (resource) {
            result.resource = resource;
            result.rules.push({
                category: resource.category,
                message: getResourceRuleMessage(resource.category)
            });
        }
    }
    
    res.json(result);
});

// Helper function to get resource rule messages
function getResourceRuleMessage(category) {
    switch(category) {
        case 'stadium':
            return 'Indoor stadium is bookable today only from 2 PM to 8 PM. Not available on Sundays.';
        case 'field':
            return 'Open field is bookable today only from 5 AM onwards.';
        case 'seminar':
            return 'Seminar halls can be booked up to 10 days in advance from 8 AM to 6 PM.';
        case 'auditorium':
            return 'Auditoriums require admin approval and can be booked up to 30 days in advance.';
        default:
            return '';
    }
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to get all resources
app.get('/api/resources', (req, res) => {
    // Filter out resources based on query parameters if any
    const { category } = req.query;
    
    let filteredResources = [...resources];
    
    if (category && category !== 'all') {
        filteredResources = filteredResources.filter(r => r.category === category);
    }
    
    // For security, don't send admin details to client
    const clientResources = filteredResources.map(resource => {
        // Create a copy without admin info
        const { adminEmails, ...safeResource } = resource;
        return safeResource;
    });
    
    res.json(clientResources);
});

// Check if a resource is available at a specific date and time
app.get('/api/resource-availability', (req, res) => {
    const { resourceId, date, time } = req.query;
    
    if (!resourceId || !date || !time) {
        return res.status(400).json({ error: 'Resource ID, date, and time are required' });
    }
    
    // Check if the resource exists
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check for existing bookings
    const existingBooking = bookings.find(b => 
        b.resourceId === resourceId && 
        (b.booking_date === date || b.date === date) && 
        (b.time_slot === time || b.time === time)
    );
    
    // Check for pending booking requests
    const pendingRequest = bookingRequests.find(r => 
        r.resourceId === resourceId && 
        (r.booking_date === date || r.date === date) && 
        (r.time_slot === time || r.time === time) &&
        r.status === 'pending'
    );
    
    // Resource is available if there are no existing bookings or pending requests
    const isAvailable = !existingBooking && !pendingRequest;
    
    res.json({
        resourceId,
        date,
        time,
        available: isAvailable,
        message: isAvailable 
            ? 'Resource is available at the specified time' 
            : 'Resource is already booked at this time'
    });
});

// Admin endpoint to create a booking (bypass normal process)
app.post('/api/admin/create-booking', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for /api/admin/create-booking');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const { userEmail, resourceId, date, time, duration, purpose, attendees, adminNotes } = req.body;
    
    // Basic validation
    if (!userEmail || !resourceId || !date || !time || !duration || !purpose || !attendees) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if resource exists
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check if resource is frozen
    if (isResourceFrozen(resourceId)) {
        return res.status(400).json({ error: 'Resource is currently frozen and unavailable for booking' });
    }
    
    // Check if user exists
    const user = users.find(u => u.email === userEmail);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate unique ID with admin prefix to indicate it was created by an admin
    const bookingId = `ADMBK${Date.now()}`;
    
    // Create booking
    const booking = {
        bookingId,
        userEmail,
        resourceId,
        date,
        time,
        duration,
        purpose,
        attendees,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        createdBy: req.session.adminEmail,
        adminNotes: adminNotes || 'Created by admin',
        booking_date: date,
        time_slot: time
    };
    
    // Save booking
    bookings.push(booking);
    
    console.log(`Admin ${req.session.adminEmail} created a booking for ${userEmail} on resource ${resourceId}`);
    
    // Send confirmation email to the user
    sendEmailNotification(userEmail, "Booking Confirmation (Created by Admin)", {
        ...booking,
        resourceName: resourceNameMapping[resourceId] || resourceId,
        adminMessage: `This booking was created on your behalf by admin: ${req.session.adminEmail}`
    });
    
    // Respond with booking details
    res.status(201).json({ 
        message: 'Booking created successfully by admin',
        booking
    });
});

// Admin endpoint to create a booking request (bypass normal process)
app.post('/api/admin/create-booking-request', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for /api/admin/create-booking-request');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    const { userEmail, resourceId, date, time, duration, purpose, attendees, adminNotes } = req.body;
    
    // Basic validation
    if (!userEmail || !resourceId || !date || !time || !duration || !purpose || !attendees) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if resource exists
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check if resource is frozen
    if (isResourceFrozen(resourceId)) {
        return res.status(400).json({ error: 'Resource is currently frozen and unavailable for booking' });
    }
    
    // Check if user exists
    const user = users.find(u => u.email === userEmail);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate unique ID with admin prefix to indicate it was created by an admin
    const requestId = `ADMRQ${Date.now()}`;
    
    // Create booking request
    const request = {
        requestId,
        userEmail,
        resourceId,
        date,
        time,
        duration,
        purpose,
        attendees,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: req.session.adminEmail,
        adminNotes: adminNotes || 'Created by admin',
        booking_date: date,
        time_slot: time
    };
    
    // Save request
    bookingRequests.push(request);
    
    console.log(`Admin ${req.session.adminEmail} created a booking request for ${userEmail} on resource ${resourceId}`);
    
    // Send notification to the user
    sendEmailNotification(userEmail, "Booking Request Submitted (Created by Admin)", {
        ...request,
        resourceName: resourceNameMapping[resourceId] || resourceId,
        adminMessage: `This booking request was created on your behalf by admin: ${req.session.adminEmail}`
    });
    
    // Respond with request details
    res.status(201).json({ 
        message: 'Booking request created successfully by admin',
        request
    });
});

// Admin endpoint to get all bookings with enhanced details
app.get('/api/admin/bookings-enhanced', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for /api/admin/bookings-enhanced');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    // Get date filters if any
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    // Get other filters
    const resourceId = req.query.resourceId;
    const status = req.query.status;
    const userEmail = req.query.userEmail;
    
    // Clone bookings to avoid modifying original data
    let filteredBookings = [...bookings];
    
    // Apply date filters
    if (startDate || endDate) {
        filteredBookings = filteredBookings.filter(booking => {
            const bookingDate = new Date(booking.date || booking.booking_date);
            
            if (startDate && endDate) {
                return bookingDate >= startDate && bookingDate <= endDate;
            } else if (startDate) {
                return bookingDate >= startDate;
            } else {
                return bookingDate <= endDate;
            }
        });
    }
    
    // Apply resource filter
    if (resourceId && resourceId !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.resourceId === resourceId);
    }
    
    // Apply status filter
    if (status && status !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }
    
    // Apply user filter
    if (userEmail) {
        filteredBookings = filteredBookings.filter(booking => booking.userEmail.includes(userEmail));
    }
    
    // Enhance bookings with resource information
    const enhancedBookings = filteredBookings.map(booking => {
        // Find corresponding resource
        const resource = resources.find(r => r.id === booking.resourceId);
        
        return {
            ...booking,
            resourceName: resource ? resource.name : resourceNameMapping[booking.resourceId] || booking.resourceId,
            resourceDetails: resource ? {
                name: resource.name,
                category: resource.category,
                location: resource.location,
                capacity: resource.capacity
            } : null
        };
    });
    
    res.json(enhancedBookings);
});

// Admin endpoint to get summarized booking data for the dashboard
app.get('/api/admin/dashboard-summary', (req, res) => {
    // Check if admin is authenticated
    if (!req.session.adminId || !req.session.isAdmin) {
        console.log('Admin not authenticated for /api/admin/dashboard-summary');
        return res.status(401).json({ error: 'Not authenticated as admin' });
    }
    
    // Get admin from session
    const admin = admins.find(admin => admin.id === req.session.adminId);
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    
    let managedResources = [];
    
    // If super admin, include all resources
    if (admin.role === ADMIN_ROLES.SUPER_ADMIN || admin.manages.includes('all')) {
        managedResources = resources.map(r => r.id);
    } else {
        // Only include resources this admin manages
        resources.forEach(resource => {
            const resourceCode = RESOURCE_CODES[resource.id];
            if (admin.manages.includes(resourceCode)) {
                managedResources.push(resource.id);
            }
        });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate total bookings
    const totalBookings = bookings.filter(b => 
        managedResources.includes(b.resourceId)
    ).length;
    
    // Calculate pending approvals
    const pendingApprovals = bookingRequests.filter(r => 
        r.status === 'pending' && managedResources.includes(r.resourceId)
    ).length;
    
    // Calculate frozen resources
    const frozenResourcesCount = frozenResources.filter(fr => 
        managedResources.includes(fr.resourceId)
    ).length;
    
    // Calculate today's bookings
    const todayBookings = bookings.filter(b => {
        const bookingDate = b.date || b.booking_date;
        return bookingDate === todayStr && managedResources.includes(b.resourceId);
    }).length;
    
    // Generate summary data
    const summary = {
        totalBookings,
        pendingApprovals,
        frozenResourcesCount,
        todayBookings,
        totalResources: managedResources.length
    };
    
    res.json(summary);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser to use the application`);
}); 