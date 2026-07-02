# ShuddhoBD 🇧🇩

[cite_start]ShuddhoBD is a transparent, technology-driven civic transparency and integrity web platform built to combat systemic corruption, public fund embezzlement, and lack of accountability in regional governance and public infrastructure development projects in Bangladesh[cite: 3219, 3221]. [cite_start]The platform bridges the information asymmetry between citizens and elected officials by offering a secure, anonymous environment for reporting irregularities, monitoring constituency expenditures, and verifying public asset disclosures[cite: 3220, 3221, 3242].

---

## 🛠️ Tech Stack & Integrations

* [cite_start]**Core Framework:** MERN Stack (MongoDB, Express.js, React.js, Node.js)[cite: 3280].
* [cite_start]**Language:** TypeScript (Strict client and server typing)[cite: 3279].
* [cite_start]**Database ORM:** Mongoose[cite: 3282].
* [cite_start]**Styling:** TailwindCSS (Fully responsive cross-device interface)[cite: 3280, 3275].
* [cite_start]**Hosting & Deployment:** Vercel[cite: 3283].
* **Third-Party Integrations & APIs:**
    * [cite_start]**Google Maps API:** Renders regional coordinates and analytical geo-hotmaps of submitted civic grievances[cite: 3228, 3259].
    * [cite_start]**Cloudinary Integration:** Offloads local database weight by directly handling file compression, security validation, and hosting for photographic or video evidence[cite: 3273, 3396].
    * [cite_start]**Cheerio & Axios Web Scraper:** Built-in server-side scraping module to automatically compile, parse, and deduplicate corruption journalism headlines from *The Business Standard*[cite: 3274, 3542].
    * [cite_start]**OpenAI/Gemini API:** Generates automated structural audit reviews, anomaly tracing, and timeline integrity recommendations for public projects[cite: 3230, 3886].
    * [cite_start]**Chart.js / React-ChartJS-2:** Interactive data-driven budget-versus-expenditure metrics and sector distribution diagrams[cite: 3228, 3253, 5553].

---

## 🚀 Core Platform Features

### 1. Secure Anonymous Whistleblowing & Tracking
[cite_start]Citizens can securely document incidents of corruption by pinning precise coordinates and uploading verification media without exposing their personal identities[cite: 3224, 3252]. [cite_start]The server structurally splits user account metadata and network footprint markers (IP/Browser Fingerprints) entirely from the document before writing to the database, instantly returning a unique mathematically randomized reference code for identity-free tracking[cite: 3224, 5820, 5821, 5851].

### 2. Intelligent Report Classification & Severity Scoring
[cite_start]Upon submitting a grievance, an automated rule-and-keyword algorithm scans the text payload[cite: 3226, 6404]. [cite_start]It instantly assigns standard categorical buckets (e.g., *Budget Misuse*, *Infrastructure Delay*, *Asset Discrepancy*) and generates an objective risk index score from 0 to 100%, alerting administrative units to high-priority incidents immediately[cite: 3226, 3331, 3332, 6405].

### 3. Parliamentary Constituency Dashboards & Civic Trust Index (CTI)
[cite_start]Maps all 300 sequential parliamentary seats of the Jatiya Sangsad[cite: 5987]. [cite_start]Clicking any seat displays details about its representative, total annual funding progress, interactive sector expenditure breakdowns, associated local projects, and a dynamically computed Civic Trust Index (CTI) score determined by the ratio of unresolved local reports to completed tasks[cite: 3227, 3260, 3272, 6032, 6034].

### 4. Project Progress Challenges
[cite_start]Empowers the collective oversight of citizens[cite: 3237]. [cite_start]If official status registries mark an infrastructure development phase as fully complete when it remains physically unfinished or neglected on-site, a citizen can submit photographic or video proof directly to queue a "Progress Challenge" for moderation[cite: 3234, 3269, 3270].

### 5. AI Civic Transparency Analyst
[cite_start]Authorized inspectors can trigger an AI-backed forensic scanning layer on project data tables[cite: 3256, 3849, 6248]. [cite_start]The pipeline detects retrospective data adjustments, unrealistic timeline completion frames, and mathematical budget discrepancies, producing clear, actionable recommendations for anti-corruption watchdogs[cite: 3230, 6251, 6263].

### 6. Dynamic Civic Audit Generation
[cite_start]Users can compile structured metrics for any constituency on demand[cite: 3231, 6407]. [cite_start]The server aggregates financial trajectories, current development project health statuses, unresolved civic metrics summaries, and overall local trust scores into a professionally compiled, printable "Civic Audit Report" PDF[cite: 6095, 6096].

---

## 📡 Essential REST API Reference

### Anonymous Grievance Submission
* [cite_start]**Endpoint:** `POST /api/reports/anonymous` [cite: 3286]
* [cite_start]**Access:** Authenticated (Token Verification) [cite: 3288]
* [cite_start]**Payload Type:** `multipart/form-data` [cite: 3288, 3310]
* **Response (201):**
    ```json
    {
      "message": "Report submitted autonomously and securely via Cloudinary.",
      "trackingId": "D52351908795A695",
      "category": "Asset Discrepancy",
      "severity": "Medium",
      "imageUrls": [...]
    }
    [cite_start]
http://googleusercontent.com/immersive_entry_chip/0
