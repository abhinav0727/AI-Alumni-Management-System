
# IMPLEMENTATION GUIDE

## PROJECT: AI-Driven Alumni Management and Engagement System

---

# PHASE 1 – Authentication System (COMPLETED)

**Summary:**
- Backend folder structure created
- MongoDB connection configured and verified
- Environment variables configured
- User model implemented (name, email, password, role, etc.)
- Password hashing using Mongoose pre("save") middleware
- POST /api/auth/register API implemented
- POST /api/auth/login API implemented
- JWT generation and validation working
- Authentication middleware (protect route) implemented
- GET /api/auth/me protected route working
- Global error handling middleware implemented
- All debugging issues resolved (Mongoose hook, next() errors, middleware structure)

**Status:**
Phase 1 fully tested and stable. Authentication system production-ready for development scope.

---

# PHASE 2 – Role-Based Access Control

**Objective:**
- Implement role middleware
- Create role-restricted routes
- Support roles: student, alumni, admin

**Tasks:**
- Create role middleware
- Restrict routes by role
- Test role restrictions

**Deliverables:**
- Only admin can access admin routes
- Students cannot access alumni-only routes

**Files to Create/Modify:**
- backend/middleware/roleMiddleware.js
- backend/routes/ (add protected sample routes)

**APIs to Implement:**
- Example: GET /api/admin/dashboard (admin only)
- Example: GET /api/alumni/mentors (alumni only)

**Testing Checklist:**
- Test with different roles and tokens
- Ensure forbidden access returns 403

**STOP HERE. WAIT FOR PHASE 3 INSTRUCTION BEFORE CONTINUING.**

---


# PHASE 3 – Profile Architecture & Management System

**Objective:**
- Separate identity (User) from role-based profile data using dedicated collections.

**Architecture Decision:**
- The "users" collection is used only for identity and authentication.
- Profile data is stored in dedicated collections:
	- studentProfiles
	- alumniProfiles

**Rationale:**
- Separating profile data ensures Student-to-Alumni Identity Continuity: the same user ID persists as a student transitions to alumni, with profile data evolving in dedicated collections.
- This approach improves scalability, simplifies role-based data management, and supports future AI/NLP integration for skill extraction and recommendations.

**Models:**

1) StudentProfile Model
	- user (ObjectId ref to User, required, unique)
	- graduationYear
	- department
	- CGPA
	- projects (array)
	- achievements (array)
	- skills (array)
	- resume (string URL)
	- timestamps

2) AlumniProfile Model
	- user (ObjectId ref to User, required, unique)
	- company
	- designation
	- yearsOfExperience
	- industry
	- location
	- skills (array)
	- isMentorAvailable (boolean, default false)
	- careerTimeline (array of objects)
	- timestamps

**APIs to Implement:**

Student:
	- GET /api/profile/student/me
	- PUT /api/profile/student/me

Alumni:
	- GET /api/profile/alumni/me
	- PUT /api/profile/alumni/me

**Middleware Required:**
- protect
- roleMiddleware

**Implementation Notes:**
- Auto-create profile on first update if not exists
- Only allow access to own profile

**Files to Create/Modify:**
- backend/models/StudentProfile.js
- backend/models/AlumniProfile.js
- backend/controllers/profileController.js
- backend/routes/profileRoutes.js

**Testing Checklist:**
- Register still works
- Login still works
- Admin dashboard still works
- Alumni mentors route still works
- Student profile GET works only for student
- Alumni profile GET works only for alumni
- Unauthorized access returns correct 401/403

**STOP HERE. WAIT FOR PHASE 4 INSTRUCTION BEFORE CONTINUING.**

---


# PHASE 4 – Hybrid Lifecycle Transition Engine (PRODUCTION DESIGN)

**OBJECTIVE**
Implement a Hybrid Lifecycle Transition Engine with:
- Dynamic eligibility computation
- Preview-confirm bulk graduation
- Single graduation
- Alumni revert capability
- User block capability
- Audit logging
- Department-based academic duration configuration

**ARCHITECTURE DECISIONS**
1. Eligibility is NOT stored in DB.
2. Eligibility is computed dynamically when admin views students.
3. Graduation is permanently stored.
4. No deletion of users or profiles.
5. AlumniProfile remains but can be deactivated.
6. Academic year is auto-calculated using admissionYear and department duration.
7. Department durations are stored in DB (config-driven, not hardcoded).
8. All graduation actions are logged in auditLogs collection.

**NEW COLLECTIONS**
1) Department Model
Fields:
- name (String, unique)
- durationYears (Number)
- degreeType (String)
- isActive (Boolean)

2) AuditLog Model
Fields:
- action (GRADUATED, REVERTED, BLOCKED)
- performedBy (admin userId)
- affectedUser (student userId)
- timestamp
- metadata (optional object)

**STUDENTPROFILE ADDITIONS**
Ensure StudentProfile includes:
- admissionYear
- registerNumber
- department
- section
- hasActiveArrears


**ELIGIBILITY LOGIC**
Eligibility is now computed as:

eligible =
graduationYear <= currentYear
AND hasActiveArrears === false
AND role === "student"

Academic year may be calculated for display only as:
academicYear = department.durationYears - (graduationYear - currentYear)
but is NOT used for eligibility decisions.

**ADMIN ENDPOINTS TO IMPLEMENT**
1) GET /api/lifecycle/students
	- Supports query filters:
	  - graduationYear
	  - department
	  - section
	  - admissionYear
	- Returns all students with computed:
	  - academicYear
	  - eligible (true/false)

2) POST /api/lifecycle/graduate/preview
	- Filters by department / batch / section
	- Returns:
	  - eligibleCount
	  - nonEligibleCount
	  - list of eligible userIds
	- No DB mutation.

3) POST /api/lifecycle/graduate/confirm
	- Requires confirm: true
	- Recomputes eligibility
	- Updates:
	  - User.role → alumni
	  - AlumniProfile.isActive → true
	- Logs action in AuditLog
	- Returns summary

4) POST /api/lifecycle/graduate/:userId
	- Single student graduation
	- Performs same validation & logging

5) POST /api/lifecycle/revert/:userId
	- role → student
	- AlumniProfile.isActive → false
	- Log action

6) POST /api/admin/block/:userId
	- user.isBlocked → true
	- Prevent login via middleware
	- Log action

**MIDDLEWARE UPDATE**
Enhance protect middleware to:
- Deny login if user.isBlocked === true

**TESTING CHECKLIST**
After implementation verify:
- Phase 1 authentication still works
- Phase 2 role restrictions still work
- Phase 3 profile APIs still work
- Eligibility computation correct
- Preview does NOT mutate DB
- Confirm mutates only eligible users
- Revert works
- Block prevents login
- Audit logs created correctly

**STOP HERE. WAIT FOR PHASE 5 INSTRUCTION BEFORE CONTINUING.**

---

# PHASE 5 – Resume Upload & NLP Skill Extraction

**Objective:**
- Upload resume
- Extract skills
- Store structured skills in DB

**Tasks:**
- File upload middleware
- Basic NLP keyword extraction
- Store skills array
- Associate skills with user

**Deliverables:**
- Resume upload working
- Skills automatically stored

**Files to Create/Modify:**
- backend/middleware/uploadMiddleware.js
- backend/services/nlpService.js
- backend/controllers/resumeController.js
- backend/routes/resumeRoutes.js
- backend/models/User.js (skills array)

**APIs to Implement:**
- POST /api/resume/upload

**Testing Checklist:**
- Upload PDF/text resume
- Check skills extraction and DB storage

**STOP HERE. WAIT FOR PHASE 6 INSTRUCTION BEFORE CONTINUING.**

---

# PHASE 6 – AI Mentor Recommendation Engine

**Objective:**
Implement an AI-driven mentor recommendation system that matches students with alumni mentors using NLP-based similarity scoring.

This phase upgrades the simple skill matching approach to an AI-powered recommendation engine.

**Architecture Overview**

The recommendation system will use:

- TF-IDF vectorization of skills
- Cosine similarity scoring
- Ranking of alumni mentors based on similarity score

Student resume skills extracted in Phase 5 will be used as the input.

Alumni skills stored in AlumniProfile will be used as the candidate mentor dataset.

**Recommendation Flow**

1) Fetch student skills from database
2) Fetch alumni mentors where isMentorAvailable = true
3) Convert skills into text documents
4) Apply TF-IDF vectorization
5) Compute cosine similarity
6) Rank mentors by similarity score
7) Return top mentors

**Deliverables**

- AI-based mentor recommendation endpoint
- Ranked mentor list
- Similarity scores returned

**Files to Create/Modify**

backend/services/recommendationService.js  
backend/controllers/mentorController.js  
backend/routes/mentorRoutes.js  

**APIs to Implement**

GET /api/mentors/recommend

Response Example:

{
  "mentors": [
    {
      "alumniId": "...",
      "name": "...",
      "company": "...",
      "skills": ["Python","ML"],
      "similarityScore": 0.82
    }
  ]
}

**Middleware Required**

- protect
- roleMiddleware("student")

**Testing Checklist**

- Student with skills receives mentor recommendations
- Mentors sorted by similarity score
- Only mentors with isMentorAvailable=true returned
- Endpoint restricted to students only

**STOP HERE. WAIT FOR PHASE 7 INSTRUCTION BEFORE CONTINUING.**

# PHASE 7 – Job & Opportunity Portal

Objective:
Create a job and internship portal where alumni can post opportunities and students can apply.

This module strengthens alumni-student engagement and supports career development.

Features

Alumni:

Post jobs

Edit job posts

Delete job posts

View jobs they posted

Students:

View available jobs

Apply to jobs

Track applications

Database Model

Job Model fields:

title

company

description

requiredSkills

location

postedBy (Alumni userId)

Applications structure:

applications (array)

Each application object contains:

student (student userId)

status ("applied", "accepted", "rejected")

appliedAt

createdAt

Files to Create/Modify

backend/models/Job.js
backend/controllers/jobController.js
backend/routes/jobRoutes.js

APIs to Implement

POST /api/jobs (alumni only)
PUT /api/jobs/:jobId (alumni edit job)
DELETE /api/jobs/:jobId (alumni delete job)
GET /api/jobs (students view jobs)
GET /api/jobs/my-jobs (alumni view jobs they posted)
POST /api/jobs/apply/:jobId (students apply to job)
GET /api/jobs/my-applications (students view applications)

Middleware Required

protect

roleMiddleware

Testing Checklist

Alumni can post jobs

Alumni can edit job posts

Alumni can delete job posts

Students can view jobs

Students can apply to jobs

Applications stored in DB

Duplicate applications prevented

Role restrictions enforced

STOP HERE. WAIT FOR PHASE 8 INSTRUCTION BEFORE CONTINUING.

# PHASE 8 – Admin Dashboard & Analytics

Objective:
Provide system-wide analytics for administrators to monitor platform activity.

Metrics to Implement

Total registered users

Total students

Total alumni

Active mentors

Jobs posted

Job applications count

Graduation transitions count

Deliverables

Admin analytics API returning system statistics.

Files to Create/Modify

backend/controllers/adminController.js
backend/routes/adminRoutes.js

APIs to Implement

GET /api/admin/stats

Example Response:

{
"totalUsers": 320,
"totalStudents": 210,
"totalAlumni": 110,
"activeMentors": 34,
"jobsPosted": 18,
"applications": 96
}

Middleware Required

protect

roleMiddleware("admin")

Testing Checklist

Only admin can access analytics

Metrics match database records

Endpoint returns aggregated data

Aggregation queries return correct counts

STOP HERE. WAIT FOR PHASE 9 INSTRUCTION BEFORE CONTINUING.

# PHASE 9 – Academic System Integration (Backend)

Objective:
Extend the backend system to support a full academic student portal including courses, attendance, internal marks, grades, fees, and timetable.

-------------------------------------

Architecture Principles

- Do NOT modify existing core models:
  - User
  - StudentProfile
  - AlumniProfile

- Only ADD new modules
- Maintain modular and scalable design
- Follow role-based access control strictly

-------------------------------------

Database Models

The following new collections must be created:

1. Course
- courseCode
- courseName
- department
- semester
- credits
- faculty (User reference)

2. Attendance
- studentId (User reference)
- courseId
- semester
- totalClasses
- attendedClasses

3. InternalMarks
- studentId
- courseId
- semester
- marksObtained
- maxMarks

4. Marks (Grades)
- studentId
- semester
- subjects:
  - courseId
  - grade
  - credits
- sgpa
- cgpa

5. Fee
- studentId
- semester
- totalAmount
- paidAmount
- status (paid / pending)

6. Timetable
- studentId
- semester
- schedule:
  - day
  - time
  - course

-------------------------------------

Controllers

Create:
backend/controllers/academicController.js

Student (Read-only APIs):
- getCourses
- getAttendance
- getInternalMarks (with semester filter)
- getMarks (with semester filter)
- getFees
- getTimetable

Admin (Write APIs):
- createCourse
- assignCourse
- updateAttendance
- updateInternalMarks
- updateMarks
- updateFees
- updateTimetable

-------------------------------------

Routes

1. Student Routes
File: backend/routes/studentRoutes.js

Protected with:
- protect middleware
- roleMiddleware("student")

Endpoints:

GET /api/student/courses  
GET /api/student/attendance  
GET /api/student/internal-marks?semester=  
GET /api/student/marks?semester=  
GET /api/student/fees  
GET /api/student/timetable  

-------------------------------------

2. Admin Routes (Extend existing)

Add endpoints:

POST /api/admin/course  
POST /api/admin/attendance  
POST /api/admin/internal-marks  
POST /api/admin/marks  
POST /api/admin/fees  
POST /api/admin/timetable  

-------------------------------------

Validation Rules

- Ensure all studentId references belong to role "student"
- Prevent duplicate entries
- Validate semester inputs
- Handle errors gracefully

-------------------------------------

Testing Checklist

- Student can fetch all academic data successfully
- Semester filtering works correctly
- Admin can create and update records
- Data consistency maintained across collections
- No existing routes are broken

-------------------------------------

Deliverables

- Fully functional academic backend module
- Clean integration with existing system
- Stable API endpoints for frontend consumption

-------------------------------------

STOP HERE. WAIT FOR PHASE 10 INSTRUCTION BEFORE CONTINUING.