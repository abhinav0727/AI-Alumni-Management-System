
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

# PHASE 6 – Mentor Matching System

**Objective:**
- Match students with alumni mentors based on skill similarity

**Tasks:**
- Skill comparison algorithm
- Overlap scoring logic
- Sorted recommendations endpoint

**Deliverables:**
- Top mentor recommendations returned

**Files to Create/Modify:**
- backend/services/matchingService.js
- backend/controllers/mentorController.js
- backend/routes/mentorRoutes.js

**APIs to Implement:**
- GET /api/mentors/recommend

**Testing Checklist:**
- Test recommendations for various students
- Validate scoring and sorting

**STOP HERE. WAIT FOR PHASE 7 INSTRUCTION BEFORE CONTINUING.**

---

# PHASE 7 – Job Portal Module

**Objective:**
- Alumni can post jobs
- Students can view & apply

**Tasks:**
- Job model
- Job CRUD endpoints
- Role restrictions
- Job recommendation logic

**Deliverables:**
- Job posting & viewing working

**Files to Create/Modify:**
- backend/models/Job.js
- backend/controllers/jobController.js
- backend/routes/jobRoutes.js

**APIs to Implement:**
- POST /api/jobs (alumni)
- GET /api/jobs (students)

**Testing Checklist:**
- Test job posting as alumni
- Test job viewing as student

**STOP HERE. WAIT FOR PHASE 8 INSTRUCTION BEFORE CONTINUING.**

---

# PHASE 8 – Admin Dashboard & Analytics

**Objective:**
- System-level visibility

**Tasks:**
- Total users
- Total alumni
- Active mentors
- System metrics

**Deliverables:**
- Admin analytics endpoints

**Files to Create/Modify:**
- backend/controllers/adminController.js
- backend/routes/adminRoutes.js

**APIs to Implement:**
- GET /api/admin/stats

**Testing Checklist:**
- Test analytics endpoints as admin

**STOP HERE. WAIT FOR PHASE 9 INSTRUCTION BEFORE CONTINUING.**

---

# PHASE 9 – Frontend Integration (React)

**Objective:**
- Connect backend to frontend

**Tasks:**
- Authentication UI
- Role-based dashboard
- Resume upload UI
- Mentor recommendation UI

**Deliverables:**
- Fully integrated working UI

**Files to Create/Modify:**
- frontend/src/pages/
- frontend/src/components/
- frontend/src/services/

**Testing Checklist:**
- Test all UI flows
- Validate backend integration

**STOP HERE. WAIT FOR PHASE 10 INSTRUCTION BEFORE CONTINUING.**

---

# PHASE 10 – AI Enhancement (Advanced)

**Objective:**
- Improve recommendation system

**Tasks:**
- TF-IDF
- Cosine similarity
- Context-aware matching

**Deliverables:**
- Smarter recommendation engine

**Files to Create/Modify:**
- backend/services/aiService.js

**APIs to Implement:**
- GET /api/ai/recommend

**Testing Checklist:**
- Validate advanced recommendations

---

For EACH phase:
- What to build
- Files to create/modify
- APIs to implement
- Database changes
- Middleware needed
- Testing checklist
- When to stop and wait

------------------------------------------
IMPORTANT RULES
------------------------------------------

- Do NOT rewrite Phase 1 implementation.
- Maintain current working backend.
- Do NOT break authentication.
- Write guide professionally.
- Save file.

After writing complete guide, stop.
Do NOT start implementing Phase 2 until instructed.

IMPORTANT:
This task is documentation-only.
Do NOT modify any existing source code files.
Only edit IMPLEMENTATION_GUIDE.md.
