# Student Enrollment Form using JsonPowerDB

![JsonPowerDB](https://img.shields.io/badge/Database-JsonPowerDB-blue?style=for-the-badge&logo=database)
![Bootstrap](https://img.shields.io/badge/Frontend-Bootstrap_5-purple?style=for-the-badge&logo=bootstrap)
![JavaScript](https://img.shields.io/badge/Language-JavaScript_ES6-yellow?style=for-the-badge&logo=javascript)
![Tests](https://img.shields.io/badge/Tests-8%2F8%20Passed-brightgreen?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

A responsive, web-based micro-project built using **HTML5**, **Bootstrap 5**, **JavaScript (ES6)**, **jQuery**, and **JsonPowerDB (JPDB)** to manage student enrollment data with dynamic primary key verification and full CRUD lifecycle controls.

---

## 📑 Table of Contents

- [Title of the Project](#student-enrollment-form-using-jsonpowerdb)
- [Description](#-description)
- [Benefits of using JsonPowerDB](#-benefits-of-using-jsonpowerdb)
- [Release History](#-release-history)
- [Illustrations](#-illustrations)
- [Scope of Functionalities](#-scope-of-functionalities)
- [Examples of Use](#-examples-of-use)
- [Project Status](#-project-status)
- [Sources](#-sources)
- [Other Information](#-other-information)
  - [Project Directory Structure](#project-directory-structure)
  - [Automated Testing Suite](#automated-testing-suite)
  - [Setup & Execution Guide](#setup--execution-guide)

---

## 📖 Description

The **Student Enrollment Form** is a full-featured data entry and management application designed to interact directly with **JsonPowerDB (JPDB)** via REST APIs (`/api/irl` and `/api/iml`). The system eliminates the need for traditional server-side backend layers (such as Node.js, PHP, or Python) by communicating securely and natively from client-side JavaScript.

### Core Database Configuration:
* **Database Name (`dbName`):** `SCHOOL-DB`
* **Relation Name (`rel`):** `STUDENT-TABLE`
* **Primary Key:** `Roll-No`
* **Attributes / Columns:**
  1. `Roll-No` (Unique Identifier / Primary Key)
  2. `Full-Name` (Student's Full Legal Name)
  3. `Class` (Current Grade / Standard, e.g. 10th-A)
  4. `Birth-Date` (Date of Birth)
  5. `Address` (Residential Address)
  6. `Enrollment-Date` (Date of School Admission)
* **Control Actions:** `[Save]`, `[Update]`, `[Reset]`

---

## ⚡ Benefits of using JsonPowerDB

**JsonPowerDB (JPDB)** is a Next-Generation, Real-time, Serverless NoSQL Database developed by Login2Xplore Technologies:

1. **Proprietary PowerIndex Engine**: Delivers ultrafast indexing and retrieval speeds, performing multiple times faster than traditional relational databases (RDBMS) like MySQL or PostgreSQL.
2. **Serverless Architecture**: Eliminates the overhead of developing and maintaining backend microservices, database drivers, or ORM frameworks. Frontend code interacts directly via REST APIs.
3. **Schema-Free & Agile**: JSON documents can evolve freely without complex schema migrations or schema locking issues.
4. **Multi-Mode Multi-Paradigm DBMS**: Unifies Document-oriented, Key-Value, and Relational models within a unified query engine.
5. **Low Memory & Resource Footprint**: Optimized C-based engine requires minimal server infrastructure, drastically reducing operational and cloud hosting costs.
6. **Real-time Analytics & Transaction Support**: Provides built-in support for real-time querying, caching, indexing, and transactional operations (`PUT`, `GET_BY_KEY`, `UPDATE`, `REMOVE`).

---

## 🕒 Release History

### **v1.0.0 (Initial Release - 2026-11-10)**
* **Repository:** [https://github.com/krypton-arch/Login2Xplore-Task](https://github.com/krypton-arch/Login2Xplore-Task)
* **Release Highlights:**
  - Initial implementation of the Student Enrollment Form meeting all Login2Xplore micro-project criteria.
  - Implemented dynamic Primary Key (`Roll-No`) validation flow.
  - Interactive UI state management matching the Step-2 protocol: form disabled until primary key lookup.
  - Integration with JPDB REST APIs using `createGET_BY_KEYRequest`, `createPUTRequest`, and `createUPDATERecordRequest`.
  - Added robust offline/network fallback with graceful degradation.
  - Added an interactive **Token Configuration Modal** allowing live token updates without modifying source code.
  - Implemented an end-to-end automated Playwright Chromium test suite verifying 8/8 comprehensive test cases.

---

## 🎨 Illustrations

### 1. Form Lifecycle & State Transition Diagram

```
 +---------------------------------------------------------------+
 |                       PAGE LOAD / RESET                       |
 |  • Form cleared                                               |
 |  • Cursor at [Roll-No] (Enabled)                              |
 |  • All other fields disabled                                  |
 |  • Buttons [Save], [Update], [Reset] disabled                 |
 +-------------------------------+-------------------------------+
                                 |
                     User enters [Roll-No]
                     and triggers check
                                 |
                                 v
                 +-------------------------------+
                 |  JPDB GET_BY_KEY Verification |
                 |     SCHOOL-DB.STUDENT-TABLE   |
                 +---------------+---------------+
                                 |
         +-----------------------+-----------------------+
         |                                               |
  Record Not Found (400)                          Record Found (200)
         |                                               |
         v                                               v
+-------------------------------+               +-------------------------------+
|       NEW STUDENT MODE        |               |      EXISTING RECORD MODE     |
| • Enable [Save] & [Reset]     |               | • Auto-populate form fields   |
| • Keep [Update] disabled      |               | • Store rec_no in LocalStorage|
| • Enable all input fields     |               | • Keep [Roll-No] DISABLED     |
| • Move focus to [Full-Name]   |               | • Enable [Update] & [Reset]   |
+---------------+---------------+               | • Keep [Save] disabled        |
                |                               | • Move focus to [Full-Name]   |
       User fills all fields                    +---------------+---------------+
                |                                               |
       Click [Save] button                             User modifies fields
                |                                               |
       Execute PUT Command                            Click [Update] button
                |                                               |
                v                                      Execute UPDATE Command
+-------------------------------+                               |
|        Data Persisted         |                               v
|  Return to Initial (Step-2)   |<------------------------------+
+-------------------------------+
```

### 2. Architecture & Data Flow Diagram

```
+-------------------------------------------------------------+
|                     Client Web Browser                      |
|  [HTML5] + [Bootstrap 5 UI] + [jQuery Event Handlers]       |
+------------------------------+------------------------------+
                               |
                   HTTP POST / JSON Payloads
                               |
                               v
+-------------------------------------------------------------+
|                 JsonPowerDB Server Endpoint                 |
|             http://api.login2explore.com:5577               |
|                                                             |
|   • /api/irl  --->  Data Retrieval (GET_BY_KEY)             |
|   • /api/iml  --->  Data Manipulation (PUT, UPDATE, REMOVE) |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    SCHOOL-DB Database                       |
|           Relation: STUDENT-TABLE (PowerIndex)              |
|  {Roll-No (PK), Full-Name, Class, Birth-Date, Address, ...} |
+-------------------------------------------------------------+
```

---

## 🎯 Scope of Functionalities

1. **Strict Primary Key Integrity**:
   - The `Roll-No` acts as the unique identifier for all student records.
   - When updating existing records, `Roll-No` is permanently locked to prevent accidental primary key mutations.
2. **Automated State Machine (Step-2 Enforcement)**:
   - On load or reset, only `Roll-No` is accessible; no orphan actions can be submitted.
   - Switching between insert mode (`Save`) and edit mode (`Update`) happens reactively based on database lookup results.
3. **Client-Side Validation Gate**:
   - Submissions are intercepted and verified to guarantee no mandatory field is left blank.
   - Clear feedback alerts direct the user to missing inputs.
4. **Record Number Tracking (`rec_no`)**:
   - Employs `localStorage` caching of internal JPDB row identifiers (`rec_no`) to ensure targeted, high-performance in-place updates.
5. **Interactive Connection Token Setup**:
   - Built-in UI modal allows dynamically setting or updating the connection token at runtime.

---

## 💡 Examples of Use

### Example 1: Enrolling a New Student
1. Open the form in any browser.
2. Cursor starts at **Roll-No**. Enter `101`.
3. Press <kbd>Enter</kbd> or <kbd>Tab</kbd> away.
4. JPDB verifies that Roll-No `101` does not exist:
   - `[Save]` and `[Reset]` buttons turn active.
   - Cursor jumps to **Full-Name**.
5. Enter student details:
   - **Full-Name:** `Rahul Sharma`
   - **Class:** `10th Grade`
   - **Birth-Date:** `2008-05-14`
   - **Address:** `42 Park Street, New Delhi`
   - **Enrollment-Date:** `2024-07-01`
6. Click **💾 Save**.
7. Confirmation alert appears: `"Student data saved successfully in SCHOOL-DB -> STUDENT-TABLE!"`.
8. Form resets back to the initial Step-2 state.

### Example 2: Updating an Existing Student
1. Enter `101` in the **Roll-No** field and press <kbd>Enter</kbd>.
2. JPDB detects the record:
   - Existing values for Rahul Sharma automatically populate all fields.
   - **Roll-No** is locked (disabled).
   - **✏️ Update** and **🔄 Reset** buttons become active; **Save** remains disabled.
   - Cursor jumps to **Full-Name**.
3. Change **Class** to `11th Grade` and update **Address** to `15 Ring Road, New Delhi`.
4. Click **✏️ Update**.
5. Confirmation alert appears: `"Student data updated successfully in SCHOOL-DB -> STUDENT-TABLE!"`.
6. Form resets back to the initial Step-2 state.

### Key API Helper Methods Used:
```javascript
// 1. Primary Key Lookup
var getReq = createGET_BY_KEYRequest(token, "SCHOOL-DB", "STUDENT-TABLE", JSON.stringify({"Roll-No": "101"}), true, true);
var res = executeCommandAtGivenBaseUrl(getReq, "http://api.login2explore.com:5577", "/api/irl");

// 2. Insert Record
var putReq = createPUTRequest(token, jsonFormData, "SCHOOL-DB", "STUDENT-TABLE");
var res = executeCommandAtGivenBaseUrl(putReq, "http://api.login2explore.com:5577", "/api/iml");

// 3. Update Record
var updateReq = createUPDATERecordRequest(token, jsonFormData, "SCHOOL-DB", "STUDENT-TABLE", localStorage.getItem("rec_no"));
var res = executeCommandAtGivenBaseUrl(updateReq, "http://api.login2explore.com:5577", "/api/iml");
```

---

## 📊 Project Status

* **Development:** **100% Complete**
* **Testing:** **8 / 8 Automated Tests Passed**
* **Deployment Readiness:** Production Ready

---

## 📚 Sources

1. **JsonPowerDB Official Documentation:** [http://login2explore.com/jpdb](http://login2explore.com/jpdb)
2. **Login2Xplore Developer Portal:** [http://login2explore.com](http://login2explore.com)
3. **JsonPowerDB Common JS Toolkit:** `http://login2explore.com/jpdb/resources/js/0.0.4/jpdb-commons.js`
4. **Bootstrap 5 UI Framework:** [https://getbootstrap.com](https://getbootstrap.com)
5. **jQuery Core Library:** [https://jquery.com](https://jquery.com)

---

## ℹ️ Other Information

### Project Directory Structure
```text
Login2Xplore/
├── index.html          # Form markup, Bootstrap 5 UI & Token modal
├── css/
│   └── style.css       # Clean, modern styling & responsive layout
├── js/
│   ├── index.js        # Core form validation, UI state handling & JPDB calls
│   └── jpdb-commons.js # Official JPDB Commons library (with network error safeguards)
├── test_suite.py       # End-to-end automated Playwright Chromium test suite
└── README.md           # Complete project documentation & release details
```

### Automated Testing Suite
The repository includes an end-to-end test suite (`test_suite.py`) built with Playwright Chromium. Run the test suite with:

```bash
python test_suite.py
```

#### Test Execution Summary:
```text
[PASSED] Test 1: Initial Page Load (Step-2 state: Roll-No enabled & focused, all others disabled)
[PASSED] Test 2: Non-Existing Roll-No enables [Save] & [Reset], leaves [Update] disabled, focuses Full-Name
[PASSED] Test 3: Form validation triggers alert on empty fields
[PASSED] Test 4: Save stores record and resets form to Step-2
[PASSED] Test 5: Existing Roll-No loads data, disables Roll-No (PK), enables [Update] & [Reset]
[PASSED] Test 6: Update modifies record and persists changes correctly
[PASSED] Test 7: [Reset] button resets form to Step-2 state
[PASSED] Test 8: JPDB Connection Token modal correctly configures & persists token

TEST RESULTS: 8/8 SUCCEEDED (100% PASSED)
```

### Setup & Execution Guide
1. Clone the repository:
   ```bash
   git clone https://github.com/krypton-arch/Login2Xplore-Task.git
   cd Login2Xplore-Task
   ```
2. Open `index.html` in any web browser.
3. Configure your connection token via the **🔑 Configure Token** button in the header.
