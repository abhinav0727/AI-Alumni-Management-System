PROJECT STATUS DOCUMENT
Project Name

AI-Driven Alumni Management and Engagement System

Tech Stack

Backend: Node.js, Express.js

Database: MongoDB with Mongoose

Authentication: JWT (JSON Web Token)

Password Security: bcrypt hashing

Environment Config: dotenv

File Upload: Multer

PDF Parsing: pdf-parse

AI Processing: TF-IDF, Cosine Similarity, NLP-based Skill Extraction

Frontend (planned): React.js

PROJECT OVERVIEW

This project is a backend system for managing student and alumni engagement in an institution.

The system maintains identity continuity, meaning a user who registers as a student can later be automatically transitioned into an alumni role after graduation without creating a new account.

The backend supports:

Authentication and authorization
Student and alumni profile management
Lifecycle transition from student → alumni
Resume upload and skill extraction
AI-based mentor recommendation system
Job and opportunity portal
Admin analytics dashboard
Secure role-based access control

The architecture is modular, scalable, and AI-ready.

PHASE 1 – AUTHENTICATION SYSTEM (COMPLETED)
Features Implemented

Backend folder structure created

MongoDB connection configured

Environment variables configured using dotenv

User model created

Fields:

name
email
password
role
isBlocked

Password hashing implemented using bcrypt

Mongoose pre("save") middleware used for password hashing

JWT token generation implemented

Global error handling middleware created

APIs Implemented
Register User

POST /api/auth/register

Login User

POST /api/auth/login

Get Current Logged User

GET /api/auth/me

Security Features

Password hashing

Token-based authentication

Protected routes using middleware

Email duplication prevention

Status

Phase 1 is fully tested and stable.

PHASE 2 – ROLE BASED ACCESS CONTROL (COMPLETED)
Features Implemented

Role-based access system created to control access to APIs based on user roles.

Supported roles:

student
alumni
admin

Middleware Implemented
protect

Validates JWT tokens and attaches user information to request.

roleMiddleware

Restricts routes based on role.

Example:

roleMiddleware('admin')
roleMiddleware('student','alumni')

APIs Implemented
Admin Dashboard (Admin only)

GET /api/admin/dashboard

Alumni Mentors Route

GET /api/alumni/mentors

Status

Phase 2 is fully implemented and tested.

PHASE 3 – PROFILE ARCHITECTURE & MANAGEMENT (COMPLETED)
Architecture Improvement

The system separates identity data from profile data.

User identity is stored in:

User

Role-specific information is stored in:

StudentProfile
AlumniProfile

This architecture supports identity continuity.

Models Created
StudentProfile

Fields include:

department
CGPA
graduationYear
projects
achievements
skills
hasActiveArrears

AlumniProfile

Fields include:

company
jobTitle
yearsOfExperience
industry
location
skills
isMentorAvailable
achievements

APIs Implemented
Create / Update Student Profile

PUT /api/profile/student/me

Get Student Profile

GET /api/profile/student/me

Create / Update Alumni Profile

PUT /api/profile/alumni/me

Get Alumni Profile

GET /api/profile/alumni/me

Features

Auto-create profile on first update

Ownership validation

Role-based access control

Scalable architecture

Status

Phase 3 fully implemented and verified.

PHASE 4 – HYBRID LIFECYCLE TRANSITION ENGINE (COMPLETED)

This phase implements the core innovation of the system.

The lifecycle engine automatically transitions users from student → alumni.

Models Added
Department

Stores department information and course duration.

AuditLog

Tracks lifecycle actions.

Fields include:

action
performedBy
affectedUser
timestamp

Lifecycle Logic

Eligibility for graduation is calculated using:

graduationYear
hasActiveArrears
user role

A student becomes eligible when:

graduationYear <= currentYear
AND hasActiveArrears = false

APIs Implemented
View Students with Eligibility

GET /api/lifecycle/students

Preview Graduation

POST /api/lifecycle/graduate/preview

Confirm Graduation

POST /api/lifecycle/graduate/confirm

Graduate Single Student

POST /api/lifecycle/graduate/:userId

Revert Graduation

POST /api/lifecycle/revert/:userId

Block User

POST /api/admin/block

Features

Student → Alumni conversion

AlumniProfile auto creation

Graduation preview system

Audit logging

Admin control over lifecycle

User blocking capability

Status

Phase 4 fully tested and stable.

PHASE 5 – RESUME UPLOAD & SKILL EXTRACTION (COMPLETED)

This phase introduces AI-ready skill extraction from resumes.

Technologies Used

Multer for file uploads

pdf-parse for extracting text from PDF resumes

Resume Upload Flow

User uploads resume

File stored in server uploads directory

PDF text extracted

Skill keywords detected using NLP service

Skills stored in role-specific profile

Services Created
NLP Service

backend/services/nlpService.js

Responsible for extracting skills from resume text.

Function:

extractSkills(text)

Resume Upload Endpoint

POST /api/resume/upload

Student Resume Processing

Upload Resume
→ Parse PDF
→ Extract text
→ NLP skill extraction
→ Save skills to StudentProfile.skills

Alumni Resume Processing

Upload Resume
→ Parse PDF
→ Extract text
→ NLP skill extraction
→ Save skills to AlumniProfile.skills
→ Automatically enable mentor availability

isMentorAvailable = true

Features

Resume upload validation

File size restriction

PDF format validation

Automatic skill extraction

Resume file storage

Skills stored in profile collections

Reusable NLP skill extraction service

Status

Phase 5 is fully tested and stable.

PHASE 6 – AI MENTOR RECOMMENDATION ENGINE (COMPLETED)

This phase introduces the AI-based mentor matching system.

Students can discover alumni mentors based on skill similarity, industry alignment, and experience level.

Recommendation Architecture

The recommendation engine analyzes:

StudentProfile.skills
AlumniProfile.skills

Using:

TF-IDF vectorization
Cosine similarity

Mentors are ranked using a weighted scoring model.

Scoring Formula

finalScore =
(0.7 × skillSimilarity)
(0.2 × industryMatchScore)
(0.1 × experienceScore)

Scoring Components
Skill Similarity

Computed using TF-IDF + cosine similarity between student and mentor skills.

Industry Match

1 if industries match
0 otherwise

Experience Score

0–2 years → 0.4
3–5 years → 1.0
6–10 years → 0.7
10+ years → 0.5

Mentor Filtering

Mentors appear only if:

isMentorAvailable = true
skills array is not empty

APIs Implemented
Get Mentor Recommendations

GET /api/mentors/recommend

Access:

Student only

Features

AI-based mentor recommendation

TF-IDF skill similarity

Cosine similarity ranking

Weighted mentor scoring

Skill normalization

Mentor filtering for empty skills

Status

Phase 6 fully implemented, integrated, and verified.

PHASE 7 – JOB & OPPORTUNITY PORTAL (COMPLETED)

This phase introduces a career opportunity portal connecting alumni and students.

Alumni can post job opportunities and students can apply directly through the platform.

Job Portal Architecture

The Job Portal is implemented using a dedicated Job model and application tracking system.

Each job includes:

Job details
Posting alumni information
Student application records

Applications are tracked using embedded documents with status and timestamps.

Model Added
Job Model

Fields include:

title
company
description
requiredSkills
location
postedBy (Alumni userId)

applications (array of objects)

Each application contains:

student (student userId)
status (applied / accepted / rejected)
appliedAt (timestamp)

APIs Implemented

Create Job (Alumni)
POST /api/jobs

Update Job (Alumni)
PUT /api/jobs/:jobId

Delete Job (Alumni)
DELETE /api/jobs/:jobId

View My Jobs (Alumni)
GET /api/jobs/my-jobs

View All Jobs (Students)
GET /api/jobs

Apply for Job (Students)
POST /api/jobs/apply/:jobId

View My Applications (Students)
GET /api/jobs/my-applications

Features

Alumni job posting system

Job editing and deletion

Student job discovery

Job application tracking

Duplicate application prevention

Role-based job permissions

Application status management

Status

Phase 7 fully implemented, integrated, and tested successfully.

PHASE 8 – ADMIN DASHBOARD & ANALYTICS SYSTEM (COMPLETED)

This phase introduces administrative analytics and user inspection capabilities.

The Admin Dashboard allows administrators to monitor platform health and inspect detailed user profiles.

Admin Analytics

Admins can view high-level platform metrics including:

Total registered users

Total students

Total alumni

Active mentors

Total jobs posted

Total job applications

Total lifecycle graduation transitions

APIs Implemented
Admin Analytics Dashboard

GET /api/admin/stats

Returns aggregated statistics across multiple collections using parallel database queries.

Admin Student Management

GET /api/admin/students
GET /api/admin/students/:id

Allows administrators to inspect complete student profiles including academic information and skills.

Admin Alumni Management

GET /api/admin/alumni
GET /api/admin/alumni/:id

Allows administrators to inspect alumni career information including company, experience, skills, and mentor availability.

Features

System-wide analytics dashboard

Parallel database queries using Promise.all

Secure role-restricted admin endpoints

Deep user profile inspection

Strict role validation preventing cross-role contamination

User profile population with secure password exclusion

Status

Phase 8 fully implemented, secured, and verified.

CURRENT SYSTEM CAPABILITIES

The system currently supports:

Secure authentication

Role-based access control

Student and alumni profile management

Automatic lifecycle transition

Graduation eligibility detection

Audit logging

Resume upload and parsing

NLP-based skill extraction

AI mentor recommendation engine

TF-IDF similarity matching

Job and opportunity portal

Student job application tracking

Admin analytics dashboard

Admin user inspection system

FUTURE PHASES (PLANNED)
Phase 9 – Frontend Integration

React-based user interface including:

Student dashboard
Alumni dashboard
Admin dashboard
Job portal UI
Mentor recommendation UI

Phase 10 – Advanced AI Recommendation Engine

Enhance recommendations using:

Advanced NLP skill analysis

Semantic similarity matching

Skill clustering and categorization

Job recommendation based on student skills