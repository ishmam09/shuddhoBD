# ShuddhoBD (শুদ্ধBD)

ShuddhoBD is a transparent, technology-driven civic integrity platform designed to combat systemic corruption, public fund embezzlement, and lack of accountability in regional governance and public infrastructure development projects in Bangladesh. By establishing a secure, anonymous environment for reporting irregularities, monitoring constituency expenditures, and verifying public candidate asset disclosures, the platform bridges the deep information asymmetry between citizens and elected representatives.

---

## 🎯 1. System Request & Strategic Alignment

### Business Need
Bangladesh faces persistent challenges in public governance, notably the systemic misuse of local development budgets, misrepresentation of infrastructure completion rates, and an absence of open-access public accountability tools. Citizens currently lack a safe, centralized, and truly anonymous platform to report local corruption, trace municipal spending, or cross-examine candidate asset filings. There is a critical, demographically urgent need for a transparent, secure, and user-friendly civic platform that protects whistleblowers, organizes public data sets, and leverages automated intelligence to flag potential corruption risks in real time.

### Business Requirements
**Secure Anonymity Pipeline:** The platform must structurally strip all file metadata and client network identifiers before writing report documents to the database, ensuring zero traceability.
**Cryptographic Progress Tracking:** Users must receive a mathematically randomized tracking code upon report submission to check status updates without ever establishing a trace back to their personal accounts.
**Evidence Validation & Challenges:** The system must accept high-resolution photographic and video uploads directly from site visits to allow citizens to contest official development metrics.
**Dynamic Regional Mapping:** An interactive mapping engine must map report locations, visually rendering regional hot-spots dynamically colored by risk status.
**Open-Access Civic Database:** The system must visually layout Bangladesh's 300 parliamentary seats, connecting each seat to candidate asset disclosure tracking charts and regional project listings.
**Automated Audit Compilations:** Users must be able to generate and instantly export a comprehensive "Civic Audit Report" PDF on demand for any particular constituency.
**AI-Powered Civic Analyst:** An automated analytical module must scan financial data sheets and reporting logs to detect temporal logic failures, budget discrepancies, and retrospective data logging, providing objective risk ratings.

### Business Value
**Empowered Citizen Oversight:** Lowers the entry barrier for civic audit participation, allowing citizens to report irregularities safely without fear of social or professional retaliation.
**Actionable Watchdog Databases:** Equips watchdogs, anti-corruption journalists, and civil society groups with clean, organized regional data grids to evaluate development outcomes against actual budgets.
**Informed Voter Behavior:** Promotes localized democracy by showcasing representative track records, financial integrity indices, and timeline delays in an accessible format.
**Scalable Risk Monitoring:** Incorporates machine learning assessments to minimize the human effort required to prioritize high-severity violations.

### Key Constraints & Operational Parameters
**Absolute Privacy Rules:** Data models must enforce metadata purging at the server handling level. No submitted report details may link back to the originating user's document ID.
**API Reliability Dependability:** Fallbacks must be engineered to handle token throttling or rate limits when interfacing with third-party service layers.
**Legal Compliance & Integrity:** All candidate asset indices and project budgets must be sourced directly from verified public gazettes, preventing misinformation and liability.
**Demographic Accessibility:** The frontend interface must remain highly responsive, lightweight, and intuitive, accommodating varying levels of digital literacy across Bangladesh.

---

## 🛠️ 2. Comprehensive Functional Requirements

**Anonymous Report Engine:** Enables citizens to submit geo-tagged corruption incident reports containing photographic or video evidence.
**Metadata De-identification Processing:** Statically strips camera metadata, user IDs, client IPs, and browser fingerprints before report serialization.
**Tracking Code Generation:** Instantly returns a randomized tracking key to the user's screen upon report entry for anonymous follow-ups.
**Google Maps Geo-Hotspot Grid:** Employs map clustering coordinates to dynamically color regions based on outstanding report levels.
**National Seat Grid Selector:** Provides an interactive digital layout of Bangladesh's 300 parliamentary seats, routing users directly to regional representative profiles.
**Multi-Year Asset Trajectory Diagramming:** Displays historical wealth trends for local members of parliament (MPs) over five-year disclosure cycles.
**Representative Integrity Dashboard:** Aggregates localized infrastructure profiles, allocated budgets, and current sector-by-sector funding splits.
**Real-Time Notification Core:** Pushes notifications to assigned administrators and users when high-severity updates or verifications occur.
**Role-Based Moderation Dashboard:** Grants distinct interfaces for Citizens and authorized Administrators/Analysts to safely review incoming report evidence.
**Interactive Project Timelines:** Breaks down public infrastructure initiatives into distinct development phases, revealing expected dates versus actual delays and localized phase-based costs.
**Progress Claim Challenges:** Grants citizens the structural tool to submit contradictory media evidence when physical progress fails to match official claims.
**Automated News Scraping Pipeline:** Gathers, indexes, and deduplicates corruption journalism headlines from public external news platforms automatically via server-side routines.
**Dynamic PDF Audit Compilation:** Builds on-the-fly analytical PDF records containing local constituency details, trust indexes, outstanding incidents, and comparative budgets.
**Token-Based Auth Middleware:** Enforces strict path access restrictions, ensuring standard users cannot access database administrative moderation actions.

---

## 🧮 3. Mathematical Models & Trust Indices

To establish an impartial, data-driven rating for elected officials and constituencies, ShuddhoBD implements a customized trust tracking score.

### Civic Trust Index (CTI)
The **Civic Trust Index (CTI)** score is generated dynamically using verified public audit matrices:

$$
\text{CTI} = \max \left( 0, 100 - \left( w_1 \cdot R_u + w_2 \cdot P_d + w_3 \cdot G_p \right) \right)
$$

Where:
$R_u$ is the count of unresolved citizen complaints verified in the constituency: 27, 2868].
$P_d$ is the project delay indicator measured in months: 27, 2868].
$G_p$ is the verified number of "ghost projects" (funded initiatives showing zero physical presence on-site): 27, 2868].
* $w_1, w_2, w_3$ represent weighted multipliers calibrated to the severity of the governance failure:
  * Complaint multiplier: $w_1 = 5$
  * Project delay multiplier: $w_2 = 10$
  * Ghost project multiplier: $w_3 = 25$

---

## 🏗️ 4. System Architecture & Component Mapping

ShuddhoBD uses a decoupled, high-performance architecture optimized to process heavy analytical payloads while keeping client footprint profiles minimal:

**Frontend Web Client:** Runs client-side sorting and search query structures: 65]. Renders data charts via Chart.js and loads the interactive map coordinate arrays through Google Maps.
**Backend API Gateway:** Houses strict authentication interceptors, formats response objects, handles schema validation via Mongoose, and coordinates communication with external APIs.
**Database Object-Relational Model:** Retains structured collections using MongoDB for candidate wealth disclosures, regional project status indexes, and moderated user files.
**Cloud Asset Storage Integration:** Validates media file integrity, processes image/video compressions, and hosts evidence uploads securely via Cloudinary to offload database storage weight.
**AI Civic Analyst Integrator:** Manages automated dataset checks utilizing Gemini AI endpoints to highlight mathematical budget deviations and temporal project anomalies.
**Automated Feed Aggregator:** Scrapes, indexes, and filters real-time anti-corruption headlines via Express controllers using Cheerio and Axios to keep citizens informed dynamically without manual overhead.

---

## 📈 5. System Performance & Quality Metrics

System network payloads are structured to ensure high accessibility across both desktop and low-bandwidth mobile devices in Bangladesh:

**Performance Score:** `99/100` (Achieved via progressive skeleton screens, server-side media optimization, and lightweight dependency bundles).
**Accessibility Rating:** `89/100` (Adheres to clean scaling standards and structured contrasts).
**Best Practices Index:** `100/100` (Enforces strict token-handling patterns and secure route boundaries).
**Search Engine Optimization (SEO):** `83/100` (Utilizes structural semantic layouts and clean header routing).
