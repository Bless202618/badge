# ITopp — Product Requirements Document

## 1\. Overview

Problem: 400-level IT students struggle to find verified, legitimate IT placement (SIWES-style) opportunities. The process today is informal, unverified, and disconnected — students rely on word-of-mouth or unverified listings, companies have no structured way to reach qualified students, and there's no accountability once a placement starts.  
Solution: ITopp is a platform that connects verified companies offering IT placements with verified 400-level students, providing matched discovery, structured applications, in-app status tracking, and support through the placement period.  
Vision statement: Bridge the gap between university walls and industry by making IT placement discovery verified, transparent, and accountable — for both students and companies.

## 2\. Target Users

* Primary: 400-level IT students seeking verified placement opportunities  
* Secondary: Companies looking to source screened, qualified IT interns  
* Platform owner (you): Verifies both sides and moderates trust on the platform

## 3\. Core Value Proposition

* Students get verified, real openings — not scams or unpaid dead ends discovered too late  
* Companies get pre-screened, eligible candidates matched to their actual criteria  
* Both sides get visibility into where things stand, instead of the current silence-and-guesswork norm

## 4\. Feature Set

### 4.1 Trust & Verification

| Feature | Description |
| :---- | :---- |
| Company verification | You personally verify each company before their account goes live (CAC check, real contact, legitimacy review) |
| Student eligibility verification | Students upload school ID \+ admission letter/proof of level and department for manual review |

### 4.2 Discovery & Matching

| Feature | Description |
| :---- | :---- |
| Hybrid discovery feed | Auto-matched openings shown first (based on student profile/criteria fit), with full browse available below |
| Custom posting criteria | Companies can set department, location, duration, required skills, and their own custom screening questions per posting |
| Quick-post template | A simplified posting flow with sensible defaults, for companies who don't want to build a full custom form |

### 4.3 Application & Review

| Feature | Description |
| :---- | :---- |
| Application cap | Students may have up to 5 active applications at a time; withdrawn/rejected applications free up a slot |
| In-app status tracking | Applications show status: Applied → Shortlisted → Accepted/Rejected. Interviews and further communication happen off-app |
| Response time indicator | Shows how long an application has been pending, and typical company response time where known |

### 4.4 During Placement

| Feature | Description |
| :---- | :---- |
| Digital logbook | Students log weekly activities; supervisor reviews and signs off in-app |
| Attendance tracking | Basic attendance record for the placement period |
| Supervisor evaluation | Supervisor submits periodic or final evaluation of the student |
| Visit scheduling | Scheduling support for any placement visits/check-ins |
| *Note: Phase 2 feature — not required for initial launch* |  |

### 4.5 Trust Loop

| Feature | Description |
| :---- | :---- |
| Two-way ratings | After placement is marked complete, students rate companies and companies rate students |
| Report button | Dedicated "Report this company" option, available at any stage — not limited to post-placement. Reports are reviewed by you within 48 hours; outcomes can include investigation, suspension, or delisting |

### 4.6 Student Profile

| Field | Notes |
| :---- | :---- |
| Name, department, level, CGPA | Basic identity/eligibility info |
| Skills list | Self-reported, searchable/matchable |
| CV/Resume upload | Visible to companies reviewing applications |

### 4.7 Notifications

| Trigger | Priority |
| :---- | :---- |
| Application status change | Launch |
| New auto-matched opening | Launch |
| Logbook/evaluation reminders | Phase 2 (tied to placement monitoring) |
| Report acknowledgment | Launch |

### 4.8 Business Model

* Free for all users at launch  
* Monetization deferred until usage data and scale justify a model (e.g., premium company features, featured listings)

## 5\. Explicitly Out of Scope (v1)

* No university/placement-office access or dashboard — platform operates independently of institutions  
* Stipend/compensation is not disclosed on postings — discussed off-app during interviews  
* No in-app messaging or interview scheduling — handled off-platform  
* No third-party/industry-body verification — you are the sole verifier at this stage

## 6\. Go-to-Market / Onboarding Strategy

* Launch narrow: one department, one student cohort  
* Personally recruit 15–20 companies with an existing history of taking interns  
* Onboard students through direct/warm channels (class groups, personal network) rather than public launch  
* Validate the full loop (verified posting → matched application → status tracking → placement) before expanding to more departments or universities

## 7\. Suggested Success Metrics

* Number of verified companies with active postings  
* Number of verified students with completed profiles  
* Application-to-shortlist conversion rate  
* Application-to-placement conversion rate  
* Report volume and resolution time (trust health indicator)

## 8\. Phased Roadmap

Phase 1 (Launch/MVP)

* Company \+ student verification  
* Hybrid discovery feed with custom criteria  
* Application flow with status tracking (capped at 5 active applications)  
* Student profile (basic \+ skills \+ CV)  
* Two-way ratings, report button  
* Core notifications (status change, new match, report acknowledgment)

Phase 2

* Full placement monitoring suite (logbook, attendance, supervisor evaluation, visit scheduling)  
* Logbook/evaluation reminder notifications  
* Possible: student-reported stipend info surfaced via post-placement reviews

Phase 3 (Future consideration)

* Monetization (premium features for companies)  
* Expansion to additional universities/departments  
* Potential industry-body verification layer as trust signal at scale

