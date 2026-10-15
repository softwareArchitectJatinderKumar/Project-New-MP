const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 1. Data Definition
const summaryData = [
  ['Name:', '', '', ''],
  ['UID:', '', '', ''],
  ['Department', '', '', ''],
  ['Total no. of interfaces/modules developed', 76, '', ''],
  ['No. of interfaces/modules on new technology', 47, '', ''],
  ['No. of interfaces/modules on old technology', 29, '', ''],
  ['', '', '', ''],
  ['DETAILS:', '', '', ''],
  ['', '', '', ''],
  ['S no.', 'Name of interface', 'New technology/old technology', 'Unique feature']
];

const interfaceRows = [
  // New Technology (Active routes from app-routing.module.ts)
  [1, 'User Authentication & Authorization Portal (auth)', 'New technology', 'Centralized secure authentication supporting role-based access control (RBAC), JWT token management, and route guard integration.'],
  [2, 'Placement IT Help Desk - Final Approval / Admin Action', 'New technology', 'Administrative final sign-off workflow, ticket resolution audit trail, and escalation handling with status updates.'],
  [3, 'Placement IT Help Desk - Ticket Registration', 'New technology', 'Interactive issue registration form featuring category classification, priority tagging, attachment upload, and auto-dispatch.'],
  [4, 'Placement IT Help Desk - Staff Ticket Action & Resolution', 'New technology', 'Staff-facing action portal allowing quick ticket assignment, intermediate remarks logging, and resolution status dispatch.'],
  [5, 'Multiple Metric Dashboard - Target Management', 'New technology', 'Multi-metric target setting interface allowing dynamic target allocation, goal tracking, and organizational KPI measurement.'],
  [6, 'OBP Admin Dashboard - Master Details Control', 'New technology', 'Comprehensive master configuration console for Outcome-Based Planning (OBP), entity hierarchies, and aggregate analytics.'],
  [7, 'OBP Metric Program Assistant (PA) Bindings', 'New technology', 'Interactive mapping tool linking outcome metrics directly to Program Assistants with real-time validation and binding status.'],
  [8, 'OBP Department Head Mapping', 'New technology', 'Hierarchical assignment interface connecting department heads with associated metric portfolios and operational assistants.'],
  [9, 'Semester Exchange - Staff Login Portal', 'New technology', 'Dedicated secure login authentication portal for semester exchange administrative and dealing staff.'],
  [10, 'Semester Exchange - Student Registration (New Way)', 'New technology', 'Optimized multi-stage student registration workflow supporting document uploads, eligibility pre-checks, and registration tokens.'],
  [11, 'Semester Exchange - Dynamic Application (New Logic)', 'New technology', 'Advanced dynamic form engine with conditional field rendering, partner university selection, and instant data validation.'],
  [12, 'Semester Exchange - Student Dashboard & Edit Portal', 'New technology', 'Personalized student dashboard providing live application lifecycle tracking, discrepancy alerts, and field editing capabilities.'],
  [13, 'Semester Exchange - Tabbed Next Steps Workflow', 'New technology', 'Structured tabbed navigation guiding students step-by-step through university allotment, visa processing, and fee clearance.'],
  [14, 'Semester Exchange - HOD Dealing Dashboard', 'New technology', 'Department Head dealing panel for evaluating student nominations, verifying departmental NOCs, and recording decisions.'],
  [15, 'Semester Exchange - Head of Wing (HOW) Dashboard', 'New technology', 'High-level wing administrative dashboard featuring bulk approval mechanisms, departmental comparisons, and review filters.'],
  [16, 'Semester Exchange - DIA HOD Dealing Dashboard', 'New technology', 'Department of International Affairs (DIA) HOD console for vetting foreign university tie-ups and international exchange dossiers.'],
  [17, 'Semester Exchange - Counsellor Dealing Dashboard', 'New technology', 'Student counseling workbench for assessing credit transfer compatibility, course mapping, and interview evaluation notes.'],
  [18, 'Semester Exchange - Comprehensive Application Details (New UI)', 'New technology', 'Role-adaptive complete view of student profile, attached certificates, course equivalencies, and multi-tier approval audit trails.'],
  [19, 'Semester Exchange - Counsellor Dashboard (New UI)', 'New technology', 'Modernized counsellor workspace equipped with interview scheduling, scoring matrices, and candidate recommendation tracking.'],
  [20, 'Semester Exchange - Faculty Dashboard (New UI)', 'New technology', 'Updated faculty evaluator interface enabling course-by-course syllabus comparison, credit mapping, and digital endorsement.'],
  [21, 'Semester Exchange - HOD Dashboard (New UI)', 'New technology', 'Redesigned executive HOD dashboard with interactive KPI stat cards, fast-track approvals, and student status distribution.'],
  [22, 'Semester Exchange - HOW Dashboard (New UI)', 'New technology', 'Consolidated wing dashboard providing cross-departmental statistics, pending approval counters, and analytical drill-downs.'],
  [23, 'Semester Exchange - HOD Admin Panel Navigation Bar', 'New technology', 'Unified top menu administrative bar providing rapid navigation across migration, exchange, and institutional management modules.'],
  [24, 'Semester Exchange - View All Applications Portal', 'New technology', 'Enterprise data grid featuring multi-column sorting, advanced search filters, status badges, and Excel export capability.'],
  [25, 'Semester Exchange - All Partner Universities Directory', 'New technology', 'Master directory listing partner universities, international rankings, active MoU status, and eligible academic programs.'],
  [26, 'Research Journal - Admin Management Portal', 'New technology', 'Administrative CMS for university research journals, managing volume releases, issue dates, and submitted manuscripts.'],
  [27, 'Research Journal - Editorial Board Interface', 'New technology', 'Public and administrative profile showcase for chief editors, associate editors, reviewers, and their institutional affiliations.'],
  [28, 'Research Journal - About & Publication Guidelines', 'New technology', 'Dynamic information page displaying journal aims and scope, indexing recognitions, publication ethics, and author guidelines.'],
  [29, 'University Event Calendar - Viewer Interface', 'New technology', 'Interactive calendar view visualizing institutional academic events, conferences, sports meets, and holiday schedules.'],
  [30, 'Staff Dress Material - Requisition Interface', 'New technology', 'Self-service staff uniform requisition module with size measurement capture, entitlement checks, and dispatch request logging.'],
  [31, 'Staff Dress Material - Approvals Management', 'New technology', 'Multi-stage approval console for validating employee dress material entitlements, vendor purchase orders, and issuance tracking.'],
  [32, 'University Event Calendar - Admin Management', 'New technology', 'Centralized event management portal allowing event scheduling, venue bookings, brochure uploads, and calendar synchronization.'],
  [33, 'Summer School - Student Registration & Portal', 'New technology', 'Public-facing summer school portal showcasing available specialized short courses, guest faculty details, and online enrollment.'],
  [34, 'Summer School - Master Configuration & Admin', 'New technology', 'Back-office administration for configuring summer school batches, syllabus structures, seat quotas, and applicant rosters.'],
  [35, 'Student Grievance Redressal Committee (SGRC) Cases Portal', 'New technology', 'Confidential grievance submission and case tracking system with hearing notice generation, evidence uploads, and committee minutes.'],
  [36, 'Memorandum of Understanding (MoU) - Approval Workflow', 'New technology', 'Hierarchical vetting portal for prospective institutional MoUs, routing agreements through legal review, HODs, and leadership.'],
  [37, 'Placement Details - Dynamic Reporting & Analytics', 'New technology', 'Dynamic reporting dashboard delivering real-time placement statistics, recruiting partner performance, and offer distributions.'],
  [38, 'MoU Management - New Request, Uploads & Renewal', 'New technology', 'End-to-end MoU submission interface supporting multi-document uploads, renewal triggers, stored procedure integration, and Excel export.'],
  [39, 'MoU Master Directory - List & Status Tracking', 'New technology', 'Comprehensive searchable directory of all signed MoUs with validity timelines, expiry alerts, partner details, and quick action modals.'],
  [40, 'MoU Approvals & Documents Report (HOS / Head)', 'New technology', 'HOS/Head evaluation portal for reviewing uploaded MoU legal drafts, verifying commitments, and authorizing final approvals.'],
  [41, 'MoU Activity - Action Planning Console', 'New technology', 'Operational planning tool to schedule academic activities, webinars, joint research projects, and student exchanges under active MoUs.'],
  [42, 'MoU Activity - Action Execution & Evidence Submission', 'New technology', 'Interface for activity coordinators to document execution, submit participant lists, attach geotagged event photos, and log impact.'],
  [43, 'MoU Activity - Action Approvals & Compliance', 'New technology', 'Verification portal for reviewing executed MoU activities against planned milestones and approving compliance certifications.'],
  [44, 'MoU Admin Action & Date-Wise Audit Reporting', 'New technology', 'Advanced date-wise analytical reporting console tracking MoU lifecycle milestones, operational KPIs, and administrative audit trails.'],
  [45, 'School Divisions - Metric & Planner Data Progress', 'New technology', 'Real-time progress tracker comparing academic school performance against assigned outcome planners with dynamic status indicators.'],
  [46, 'UMS Criteria Master Configuration Interface', 'New technology', 'Master configuration panel for university criteria scoring, weightage distribution, and accreditation compliance parameters.'],
  [47, 'Placement Coordinator - Dynamic Performance Report', 'New technology', 'Customizable reporting module for placement coordinators to filter students by CGPA, branch, attendance, and selection outcomes.'],

  // Old Technology (Legacy / Replaced modules documented in app-routing.module.ts)
  [48, 'OBP Metric Allocation Transfer Tool (Legacy)', 'Old technology', 'Administrative utility for batch reassigning and transferring OBP metric responsibilities between academic departments.'],
  [49, 'Auto Assign Metric & OBP Auto Planners (Legacy)', 'Old technology', 'Automated rule-based algorithm engine for distributing academic metrics and targets among faculty coordinators.'],
  [50, 'RMS Distance Tracking & Travel Report (Legacy)', 'Old technology', 'Reporting module calculating official transit distances, travel allowances, and field visit logs for resource staff.'],
  [51, 'Estate Actionable Point - Task Completion (Legacy)', 'Old technology', 'Field task resolution interface for logging campus maintenance repairs, inspection sign-offs, and completion timestamps.'],
  [52, 'Estate Actionable Point - Master Tracking (Legacy)', 'Old technology', 'Campus infrastructure maintenance ticketing system tracking actionable points, assigned supervisors, and resolution SLA.'],
  [53, 'Placement Drive - Student Registration Portal (Legacy)', 'Old technology', 'Student placement registration interface for opting into campus recruitment drives and submitting initial resumes.'],
  [54, 'Placement Drive - HOD Clearance & Approval (Legacy)', 'Old technology', 'Departmental clearance portal for verifying academic eligibility and attendance compliance before placement drive entry.'],
  [55, 'Resource Management System (RMS) - Dashboard (Legacy)', 'Old technology', 'Central dashboard tracking departmental resource requisitions, staff allocations, and operational inventory statistics.'],
  [56, 'MoU Executive Overview Dashboard (Legacy)', 'Old technology', 'Preliminary dashboard summarizing total active MoUs, partner countries, and department-wise agreements.'],
  [57, 'Agreement Data Entry & Record Keeping (Legacy)', 'Old technology', 'Data entry interface for archiving paper-based bilateral agreements, institutional clauses, and signatory details.'],
  [58, 'RMS Activity & Audit Transaction Log (Legacy)', 'Old technology', 'Historical transaction logging tool recording every RMS record change, user stamp, and state transition.'],
  [59, 'Agreement Activity Planning Module (Legacy)', 'Old technology', 'Basic calendar scheduler for registering collaborative seminars and faculty visits under active institutional agreements.'],
  [60, 'RMS Pendency & Delayed Requisition Report (Legacy)', 'Old technology', 'Overdue task analyzer highlighting pending resource approvals, delayed material dispatches, and SLA breaches.'],
  [61, 'Career Services & Student Mentorship (Legacy)', 'Old technology', 'Advisory portal linking graduating students with career counselors, resume reviewers, and mock interviewers.'],
  [62, 'MoU Mobile Overview Interface (Legacy)', 'Old technology', 'Responsive mobile-friendly view summarizing key institutional MoU metrics for leadership on handheld devices.'],
  [63, 'Construction RMS - Civil Infrastructure Monitoring (Legacy)', 'Old technology', 'Civil works management module monitoring ongoing construction project milestones, contractor logs, and material requisitions.'],
  [64, 'Alumni Relations & Engagement Network (Legacy)', 'Old technology', 'Institutional alumni networking platform managing graduate directory, chapter events, and alumni contribution initiatives.'],
  [65, 'Parent Communication & Academic Progress Portal (Legacy)', 'Old technology', 'Automated parent notification system dispatching student semester grades, attendance warnings, and campus notices.'],
  [66, 'Planner Score & Performance Ranking Matrix (Legacy)', 'Old technology', 'Ranking engine scoring departmental planners based on milestone achievement speed and outcome delivery quality.'],
  [67, 'University Administrative Summary Report (Legacy)', 'Old technology', 'Comprehensive institutional report consolidating operational data across academic, estate, and HR departments.'],
  [68, 'RMS Telephonic Daily Status Report (DSR) (Legacy)', 'Old technology', 'Call center logging system recording telephonic queries, grievance follow-ups, and daily operational status.'],
  [69, 'Research Journal Editor & Modification Tool (Legacy)', 'Old technology', 'Early-generation journal editing tool for correcting published manuscript metadata and updating editorial lists.'],
  [70, 'RMS QR Code Scanner & Verification (Legacy)', 'Old technology', 'Barcode and QR scanning interface for authenticating physical gate passes, asset tags, and delivery dispatches.'],
  [71, 'RMS DSR Performance Rating & Feedback Report (Legacy)', 'Old technology', 'Staff evaluation interface analyzing client satisfaction ratings, response times, and daily resolution metrics.'],
  [72, 'RMS Dealing Official Caseload Report (Legacy)', 'Old technology', 'Operational caseload monitor displaying active tickets, resolved files, and turnaround benchmarks per dealing officer.'],
  [73, 'OBP Stage-Wise Construction Dashboard (Legacy)', 'Old technology', 'Physical infrastructure progress monitor tracking site excavation, structural framing, and finishing phases.'],
  [74, 'OBP Estate Final Verification & Handover (Legacy)', 'Old technology', 'Estate audit module certifying completion of civil works, safety sign-offs, and final facility handover.'],
  [75, 'Outreach Appointments & Meeting Scheduler (Legacy)', 'Old technology', 'Calendar appointment system coordinating institutional outreach visits, school visits, and guest delegation meetings.'],
  [76, 'Legacy Criteria Master Configuration Module', 'Old technology', 'Legacy criteria structure for university management system accreditation frameworks.']
];

const allData = summaryData.concat(interfaceRows);

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(allData);

// Set formulas
ws['B4'] = { t: 'n', f: 'COUNTA(B11:B86)', v: 76 };
ws['B5'] = { t: 'n', f: 'COUNTIF(C11:C86,"*New*")', v: 47 };
ws['B6'] = { t: 'n', f: 'COUNTIF(C11:C86,"*Old*")', v: 29 };

// Column widths
ws['!cols'] = [
  { wch: 10 },  // S no.
  { wch: 45 },  // Name of interface
  { wch: 30 },  // New technology/old technology
  { wch: 75 }   // Unique feature
];

XLSX.utils.book_append_sheet(wb, ws, 'Interface Details');

const outputPath = path.join(__dirname, 'Interfaces_Development_Details.xlsx');
XLSX.writeFile(wb, outputPath);
console.log('Successfully generated ' + outputPath);
