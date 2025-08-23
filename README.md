#  Online Course Platform

A full-featured **online learning platform** built for learners and instructors to create, manage, and engage with educational content. This system supports courses, quizzes, assignments, articles, certificates, support tickets, and more.

---

##  Features Overview

### 1.  User Management
- Role-based access: `learner`, `admin`, `instructor`, `support`, `moderator`
- Email/password & Google OAuth login
- Two-Factor Authentication (2FA) with backup codes
- Email verification and token-based password resets

### 2.  Courses & Lessons
- Create and manage courses by instructors
- Course features:
  - Title, description, image, category, price, learning outcomes
  - Course types: `free` and `paid`
- Lesson system includes video content, descriptions, and attachments
- Lesson approval flow and user progress tracking

### 3.  Lesson System
- Lessons are organized under courses
- Approval via `LessonsApprovel` model
- Progress tracking per lesson for each user

### 4.  Quiz System
- Quizzes assigned per course
- Question types: MCQ, True/False, Text
- Attempts tracked per user
- Score calculation and total marks management
- integrate AI suggestion for questions based on quiz and course name

### 5.  Assignment System
- Instructors can create assignments
- Students can submit and receive grades & feedback
- Support for deadlines and multiple submissions

### 6.  Certificate Request System
- Users can request a certificate after course completion
- Statuses: `pending`, `approved`, `rejected`
- Includes `verification_code` and `certificate_url`

### 7.  Payment System
- Supports Stripe and Bank Transfers
- Tracks payment status and methods
- Used to manage access to paid courses

### 8. User Progress Tracking
- Tracks lesson completion, quiz scores, and assignment results
- Visual dashboards for learners

### 9.  Reviews, Likes & Bookmarks
- Leave course reviews
- Like and bookmark courses or articles
- Track views and interactions

### 10.  Instructor Application System
- Allows users to apply as instructors
- Includes education, experience, availability, and preferred teaching types
- Review and approval system

### 11. Article CMS System
- Rich blog/article creation with:
  - SEO metadata
  - Tags and categories
  - Modular content blocks (text, code, image, etc.)
- Article approval system and reader interactions

### 12.  Support Ticketing
- Learners and instructors can raise support tickets
- Staff can be assigned to resolve tickets
- Messaging system with read status and tokenized access

### 13.  Notifications
- In-app notifications for events:
  - New assignments
  - Quiz deadlines
  - Course updates

---

##  Tech Stack

###  Backend
- **Node.js**
- **Express.js**
- **Prisma ORM**
- **PostgreSQL** (via Aiven)
- **RESTful API design**
- **Google Cloud Platform (GCP)** for google auth

###  Frontend
- **React Vite **
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling

###  Other Tools
- **Stripe** for payments
- **JWT** & **OAuth 2.0** (Google) for authentication
- **Nodemailer** or third-party services for emails

