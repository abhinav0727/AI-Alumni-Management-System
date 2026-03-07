# PROJECT STATUS DOCUMENT

## Project Name

**AI-Driven Alumni Management and Engagement System**

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Authentication:** JWT (JSON Web Token)
* **Password Security:** bcrypt hashing
* **Environment Config:** dotenv
* **File Upload:** Multer
* **PDF Parsing:** pdf-parse
* **Frontend (planned):** React.js

---

# PROJECT OVERVIEW

This project is a **backend system for managing student and alumni engagement** in an institution.

The system maintains **identity continuity**, meaning a user who registers as a **student** can later be **automatically transitioned into an alumni role** after graduation without creating a new account.

The backend supports:

* Authentication and authorization
* Student and alumni profile management
* Lifecycle transition from student → alumni
* Resume upload and skill extraction
* Secure role-based access control

The architecture is **modular, scalable, and AI-ready**.

---

# PHASE 1 – AUTHENTICATION SYSTEM (COMPLETED)

## Features Implemented

* Backend folder structure created
* MongoDB connection configured
* Environment variables configured using dotenv
* **User model created**

Fields:

* name

* email

* password

* role

* isBlocked

* extractedSkills

* resumeURL

* Password hashing implemented using **bcrypt**

* Mongoose **pre("save") middleware** used for password hashing

* JWT token generation implemented

* Global error handling middleware created

## APIs Implemented

### Register User

```
POST /api/auth/register
```

### Login User

```
POST /api/auth/login
```

### Get Current Logged User

```
GET /api/auth/me
```

## Security Features

* Password hashing
* Token-based authentication
* Protected routes using middleware
* Email duplication prevention

## Status

Phase 1 is **fully tested and stable**.

---

# PHASE 2 – ROLE BASED ACCESS CONTROL (COMPLETED)

## Features Implemented

Role-based access system created to control access to APIs based on user roles.

Supported roles:

* student
* alumni
* admin

## Middleware Implemented

### protect

Validates JWT tokens and attaches user information to request.

### roleMiddleware

Restricts routes based on role.

Example:

```
roleMiddleware('admin')
roleMiddleware('student','alumni')
```

## APIs Implemented

### Admin Dashboard (Admin only)

```
GET /api/admin/dashboard
```

### Alumni Mentors Route

```
GET /api/alumni/mentors
```

## Status

Phase 2 is **fully implemented and tested**.

---

# PHASE 3 – PROFILE ARCHITECTURE & MANAGEMENT (COMPLETED)

## Architecture Improvement

The system separates **identity data** from **profile data**.

User identity is stored in:

```
User
```

Role-specific information is stored in:

```
StudentProfile
AlumniProfile
```

This architecture supports **identity continuity**.

## Models Created

### StudentProfile

Fields include:

* department
* CGPA
* graduationYear
* projects
* achievements
* skills
* hasActiveArrears

### AlumniProfile

Fields include:

* company
* jobTitle
* experience
* mentorAvailability
* skills
* achievements

## APIs Implemented

### Create / Update Student Profile

```
PUT /api/profile/student
```

### Get Student Profile

```
GET /api/profile/student/me
```

### Create / Update Alumni Profile

```
PUT /api/profile/alumni
```

### Get Alumni Profile

```
GET /api/profile/alumni/me
```

## Features

* Auto-create profile on first update
* Ownership validation
* Role-based access control
* Scalable architecture

## Status

Phase 3 **fully implemented and verified**.

---

# PHASE 4 – HYBRID LIFECYCLE TRANSITION ENGINE (COMPLETED)

This phase implements the **core innovation of the system**.

The lifecycle engine automatically transitions users from **student → alumni**.

## Models Added

### Department

Stores department information and course duration.

### AuditLog

Tracks lifecycle actions.

Fields include:

* action
* performedBy
* affectedUser
* timestamp

## Lifecycle Logic

Eligibility for graduation is calculated using:

```
graduationYear
hasActiveArrears
user role
```

A student becomes eligible when:

```
graduationYear <= currentYear
AND hasActiveArrears = false
```

## APIs Implemented

### View Students with Eligibility

```
GET /api/lifecycle/students
```

### Preview Graduation

```
POST /api/lifecycle/graduate/preview
```

### Confirm Graduation

```
POST /api/lifecycle/graduate/confirm
```

### Graduate Single Student

```
POST /api/lifecycle/graduate/:userId
```

### Revert Graduation

```
POST /api/lifecycle/revert/:userId
```

### Block User

```
POST /api/admin/block
```

## Features

* Student → Alumni conversion
* AlumniProfile auto creation
* Graduation preview system
* Audit logging
* Admin control over lifecycle
* User blocking capability

## Status

Phase 4 **fully tested and stable**.

System confirmed working with:

* role transition
* lifecycle logic
* revert functionality
* audit logs

---

# PHASE 5 – RESUME UPLOAD & SKILL EXTRACTION (COMPLETED)

This phase introduces **AI-ready skill extraction from resumes**.

## Technologies Used

* **Multer** for file uploads
* **pdf-parse** for extracting text from PDF resumes

## Resume Upload Flow

1. User uploads resume
2. File stored in server uploads directory
3. PDF text extracted
4. Skill keywords detected
5. Skills stored in database

## Database Fields Added

In **User model**:

```
resumeURL
extractedSkills
```

## APIs Implemented

### Upload Resume

```
POST /api/resume/upload
```

Functionality:

* Accept PDF resume
* Extract text
* Detect skills
* Save skills to database

### Get Extracted Skills

```
GET /api/resume/skills
```

Returns stored skills.

## Skill Extraction Logic

Uses keyword matching from a predefined skill list such as:

* JavaScript
* Python
* Node.js
* React
* MongoDB
* Docker
* Machine Learning
* Git
* SQL
* HTML
* CSS

## Features

* Resume upload validation
* File size restriction
* PDF format validation
* Automatic skill extraction
* Resume file storage
* Skill persistence in database

## Status

Phase 5 is **fully tested and stable**.

---

# CURRENT SYSTEM CAPABILITIES

The system currently supports:

* Secure authentication
* Role-based access control
* Student and alumni profile management
* Automatic lifecycle transition
* Graduation eligibility detection
* Audit logging
* Resume upload
* PDF parsing
* Skill extraction from resumes
* Secure API architecture

---

# FUTURE PHASES (PLANNED)

Upcoming features include:

### Phase 6 – Mentor Matching System

Match students with alumni mentors based on skills.

### Phase 7 – Job Portal Module

Allow alumni to post job opportunities.

### Phase 8 – AI Recommendation Engine

Recommend mentors and jobs using skill similarity.

### Phase 9 – Admin Dashboard

Analytics and system insights.

### Phase 10 – Frontend Integration

React-based user interface.

---

# UPDATE LOG

### February 27, 2026

* Implemented scalable profile architecture
* Created StudentProfile and AlumniProfile
* Verified stability of authentication system

### February 28, 2026

* Implemented lifecycle engine
* Added graduation eligibility logic
* Added revert and preview APIs
* Implemented audit logging

### March 7, 2026

* Implemented resume upload system
* Integrated pdf-parse for resume parsing
* Added keyword-based skill extraction
* Fixed pdf-parse compatibility issue
* Completed Phase 5 testing
* System stability verified

---

# SYSTEM STABILITY STATUS

**Current Stability Level:**
Production-ready for backend scope.

All implemented phases (1–5) are **fully functional and tested**.

---

# DOCUMENTATION RULES

* This file tracks the full development lifecycle.
* Completed phases are never removed.
* New phases are appended below.
* This file acts as permanent project memory.


