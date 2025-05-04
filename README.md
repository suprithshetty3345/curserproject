# Pattern Unlock CAPTCHA Authentication System

A web application featuring a secure pattern-based CAPTCHA system for user authentication. The application includes user registration, login, and a dashboard interface, all protected by a modern CAPTCHA mechanism inspired by mobile pattern unlock systems.

## Features

- **Pattern-based CAPTCHA**: Dynamic grid sizes (2x2 to 5x5) with random node values and connecting arrows.
- **User Authentication**: Secure login and registration forms with client and server-side validation.
- **Dashboard**: User profile information and statistics display after successful authentication.
- **Security Measures**: Password hashing with bcrypt, session management, and CAPTCHA verification to prevent automated attacks.

## Getting Started

### Prerequisites

- Node.js (v12 or higher recommended)
- npm (Node Package Manager)

### Installation

1. Clone or download this repository to your local machine.

2. Navigate to the project directory:
   ```
   cd path/to/projectUsingCursor
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   node server.js
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000
   ```

3. The application should be running now. You can register a new account and login.

## How to Use the CAPTCHA

1. When registering or logging in, a pattern CAPTCHA will be displayed.
2. Each circle contains a number and is connected by arrows to form a pattern.
3. Trace the pattern by clicking or touching the circles in the same order as the arrows connect them.
4. If you make a mistake, click "Try New Pattern" to generate a new CAPTCHA.
5. After successfully tracing the pattern, you can submit the form.

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js with Express.js
- **Database**: In-memory storage (for demonstration purposes)
- **Security**: bcrypt for password hashing, express-session for session management

## Security Notes

This application uses several security features:
- Passwords are hashed using bcrypt before storage
- CAPTCHA verification to prevent automated submissions
- Session management to maintain authenticated state
- Client and server-side validation of forms and CAPTCHA patterns

## Future Enhancements

- Database integration (MySQL, MongoDB)
- Additional CAPTCHA variations
- Two-factor authentication
- Account recovery options
- Admin dashboard for user management 