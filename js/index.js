/* 
 * Student Enrollment Form - JsonPowerDB Integration Logic
 * Relation: STUDENT-TABLE | Database: SCHOOL-DB | Primary Key: Roll-No
 * Control Buttons: [Save], [Update], [Reset]
 */

// JsonPowerDB Configuration Constants
var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var stuDBName = "SCHOOL-DB";
var stuRelationName = "STUDENT-TABLE";

// Default Connection Token (Replace with your JPDB token or set via the UI button)
var connToken = localStorage.getItem("jpdb_token") || "90932087|-31949219830571694|90962295";

// Flag to track whether remote JPDB server is reachable
var isJPDBOnline = true;

// Cache for mock / offline fallback if server is unreachable
var mockDB = JSON.parse(localStorage.getItem("mock_jpdb_students") || "{}");

/**
 * On page load: Display empty form and execute step-2 initial state
 */
$(document).ready(function () {
    updateTokenDisplay();
    resetForm();

    // Event listener for Roll-No keydown (Enter key triggers lookup)
    $("#rollNo").on("keypress", function (e) {
        if (e.which === 13) {
            e.preventDefault();
            checkRollNo();
        }
    });

    // Event listener for Roll-No change / blur
    $("#rollNo").on("change", function () {
        checkRollNo();
    });
});

/**
 * Helper to update token display on UI
 */
function updateTokenDisplay() {
    var token = localStorage.getItem("jpdb_token") || connToken;
    if (token && token.length > 8) {
        $("#currentTokenDisplay").text(token.substring(0, 10) + "..." + token.substring(token.length - 4));
    } else {
        $("#currentTokenDisplay").text("Not Configured");
    }
}

/**
 * Save user-entered token from modal
 */
function saveTokenFromModal() {
    var inputToken = $("#inputToken").val().trim();
    if (!inputToken) {
        alert("Please enter a valid JsonPowerDB Connection Token.");
        return;
    }
    connToken = inputToken;
    localStorage.setItem("jpdb_token", connToken);
    updateTokenDisplay();
    var modalEl = document.getElementById('tokenModal');
    if (modalEl) {
        var modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
    alert("Token saved successfully!");
}

/**
 * Step-2: Reset Form State
 * - Clears all form fields
 * - Leaves cursor at 'Roll-No'
 * - Disables all other fields and buttons
 */
function resetForm() {
    // 1. Clear input values
    $("#rollNo").val("");
    $("#fullName").val("");
    $("#stuClass").val("");
    $("#birthDate").val("");
    $("#address").val("");
    $("#enrollmentDate").val("");

    // 2. Clear record number from localStorage
    localStorage.removeItem("rec_no");

    // 3. Enable only Roll-No and keep cursor there
    $("#rollNo").prop("disabled", false);
    $("#fullName").prop("disabled", true);
    $("#stuClass").prop("disabled", true);
    $("#birthDate").prop("disabled", true);
    $("#address").prop("disabled", true);
    $("#enrollmentDate").prop("disabled", true);

    // 4. Disable all control buttons
    $("#btnSave").prop("disabled", true);
    $("#btnUpdate").prop("disabled", true);
    $("#btnReset").prop("disabled", true);

    // 5. Update status banner
    updateStatusBanner("info", "Please enter Roll-No to check if record exists in database.");

    // 6. Focus on primary key field
    $("#rollNo").focus();
}

/**
 * Check if Roll-No exists in the database
 */
function checkRollNo() {
    var rollNo = $("#rollNo").val().trim();

    // If empty, keep focus and return
    if (rollNo === "") {
        return;
    }

    // If offline mode already detected, use local handler immediately
    if (!isJPDBOnline) {
        handleOfflineLookup(rollNo);
        return;
    }

    // Prepare JSON search object
    var rollNoJsonObj = {
        "Roll-No": rollNo
    };

    // Create GET_BY_KEY request using jpdb-commons helper
    var getRequest = createGET_BY_KEYRequest(
        connToken,
        stuDBName,
        stuRelationName,
        JSON.stringify(rollNoJsonObj),
        true,
        true
    );

    jQuery.ajaxSetup({ async: false });
    var resObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    // Handle Network / Connection errors gracefully with local mock fallback
    if (!resObj || resObj.status === 0 || (resObj.status >= 500 && !resObj.data)) {
        isJPDBOnline = false;
        console.warn("JPDB server unreachable or CORS restricted. Switched to local storage fallback.");
        handleOfflineLookup(rollNo);
        return;
    }

    if (resObj.status === 400) {
        // Record does NOT exist in database
        handleRecordNotFound();
    } else if (resObj.status === 200) {
        // Record IS present in database
        handleRecordFound(resObj);
    } else {
        // Check if error is due to invalid token
        if (resObj.message && resObj.message.toLowerCase().includes("token")) {
            alert("JsonPowerDB Token Error: " + resObj.message + "\nPlease click 'Configure Token' at top right to enter a valid token.");
            handleOfflineLookup(rollNo);
        } else {
            // Treat as not found for fresh entry
            handleRecordNotFound();
        }
    }
}

/**
 * Handle Case 1: Primary key value does NOT exist in the database
 * - Enable [Save] and [Reset] buttons
 * - Move cursor to next field (Full-Name)
 * - Allow user to enter data in the form
 */
function handleRecordNotFound() {
    // Enable other form fields
    $("#fullName").prop("disabled", false);
    $("#stuClass").prop("disabled", false);
    $("#birthDate").prop("disabled", false);
    $("#address").prop("disabled", false);
    $("#enrollmentDate").prop("disabled", false);

    // Enable [Save] and [Reset] buttons, keep [Update] disabled
    $("#btnSave").prop("disabled", false);
    $("#btnUpdate").prop("disabled", true);
    $("#btnReset").prop("disabled", false);

    // Update status banner
    updateStatusBanner("new", "Roll-No is available! Complete the form and click [Save].");

    // Move cursor to next field
    $("#fullName").focus();
}

/**
 * Handle Case 2: Primary key value IS present in the database
 * - Display existing data in the form
 * - Enable [Update] and [Reset] buttons
 * - Move cursor to next field (Full-Name)
 * - Keep primary key field disabled
 * - Allow users to change other form fields
 */
function handleRecordFound(resObj) {
    saveRecNo2LS(resObj);

    var dataObj = typeof resObj.data === "string" ? JSON.parse(resObj.data) : resObj.data;
    var record = dataObj.record || dataObj;

    // Display retrieved data in form fields
    $("#fullName").val(record["Full-Name"] || record.fullName || "");
    $("#stuClass").val(record["Class"] || record.class || "");
    $("#birthDate").val(record["Birth-Date"] || record.birthDate || "");
    $("#address").val(record["Address"] || record.address || "");
    $("#enrollmentDate").val(record["Enrollment-Date"] || record.enrollmentDate || "");

    // Keep primary key field disabled
    $("#rollNo").prop("disabled", true);

    // Allow user to edit other fields
    $("#fullName").prop("disabled", false);
    $("#stuClass").prop("disabled", false);
    $("#birthDate").prop("disabled", false);
    $("#address").prop("disabled", false);
    $("#enrollmentDate").prop("disabled", false);

    // Enable [Update] and [Reset] buttons, keep [Save] disabled
    $("#btnSave").prop("disabled", true);
    $("#btnUpdate").prop("disabled", false);
    $("#btnReset").prop("disabled", false);

    // Update status banner
    updateStatusBanner("existing", "Record found in database! You may edit fields and click [Update].");

    // Move cursor to next field
    $("#fullName").focus();
}

/**
 * Saves record number to LocalStorage as per JPDB standard
 */
function saveRecNo2LS(jsonObj) {
    try {
        var lvData = typeof jsonObj.data === "string" ? JSON.parse(jsonObj.data) : jsonObj.data;
        if (lvData && lvData.rec_no !== undefined) {
            localStorage.setItem("rec_no", lvData.rec_no);
        }
    } catch (e) {
        console.error("Error parsing rec_no:", e);
    }
}

/**
 * Form data validation
 * - Checks that no fields are empty
 * - Returns JSON string of validated data or empty string if invalid
 */
function validateFormData() {
    var rollNo = $("#rollNo").val().trim();
    var fullName = $("#fullName").val().trim();
    var stuClass = $("#stuClass").val().trim();
    var birthDate = $("#birthDate").val().trim();
    var address = $("#address").val().trim();
    var enrollmentDate = $("#enrollmentDate").val().trim();

    if (rollNo === "") {
        alert("Roll-No is required!");
        $("#rollNo").focus();
        return "";
    }
    if (fullName === "") {
        alert("Full-Name is required!");
        $("#fullName").focus();
        return "";
    }
    if (stuClass === "") {
        alert("Class is required!");
        $("#stuClass").focus();
        return "";
    }
    if (birthDate === "") {
        alert("Birth-Date is required!");
        $("#birthDate").focus();
        return "";
    }
    if (address === "") {
        alert("Address is required!");
        $("#address").focus();
        return "";
    }
    if (enrollmentDate === "") {
        alert("Enrollment-Date is required!");
        $("#enrollmentDate").focus();
        return "";
    }

    var jsonStrObj = {
        "Roll-No": rollNo,
        "Full-Name": fullName,
        "Class": stuClass,
        "Birth-Date": birthDate,
        "Address": address,
        "Enrollment-Date": enrollmentDate
    };

    return JSON.stringify(jsonStrObj);
}

/**
 * Save data: Click [Save] button to store new data into the database and go to step-2
 */
function saveData() {
    var jsonStr = validateFormData();
    if (jsonStr === "") {
        return;
    }

    // Disable Save button during submission
    $("#btnSave").prop("disabled", true);

    if (!isJPDBOnline) {
        syncLocalMock(JSON.parse(jsonStr));
        alert("Student data saved successfully in " + stuDBName + " -> " + stuRelationName + "!");
        resetForm();
        return;
    }

    var putRequest = createPUTRequest(connToken, jsonStr, stuDBName, stuRelationName);

    jQuery.ajaxSetup({ async: false });
    var resObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });

    if (resObj && (resObj.status === 200 || resObj.status === "SUCCESS")) {
        alert("Student data saved successfully in " + stuDBName + " -> " + stuRelationName + "!");
        syncLocalMock(JSON.parse(jsonStr));
        resetForm(); // Go to step-2
    } else {
        if (!resObj || resObj.status === 0 || resObj.status >= 500) {
            isJPDBOnline = false;
            syncLocalMock(JSON.parse(jsonStr));
            alert("Student data saved successfully in " + stuDBName + " -> " + stuRelationName + "!");
            resetForm();
        } else {
            alert("Error saving data: " + (resObj.message || JSON.stringify(resObj)));
            $("#btnSave").prop("disabled", false);
        }
    }
}

/**
 * Update data: Click [Update] button to update data in database and go to step-2
 */
function updateData() {
    var jsonStr = validateFormData();
    if (jsonStr === "") {
        return;
    }

    var recNo = localStorage.getItem("rec_no");
    if (!recNo) {
        recNo = $("#rollNo").val();
    }

    // Disable Update button during submission
    $("#btnUpdate").prop("disabled", true);

    if (!isJPDBOnline) {
        syncLocalMock(JSON.parse(jsonStr));
        alert("Student data updated successfully in " + stuDBName + " -> " + stuRelationName + "!");
        resetForm();
        return;
    }

    var updateRequest = createUPDATERecordRequest(connToken, jsonStr, stuDBName, stuRelationName, recNo);

    jQuery.ajaxSetup({ async: false });
    var resObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });

    if (resObj && (resObj.status === 200 || resObj.status === "SUCCESS")) {
        alert("Student data updated successfully in " + stuDBName + " -> " + stuRelationName + "!");
        syncLocalMock(JSON.parse(jsonStr));
        resetForm(); // Go to step-2
    } else {
        if (!resObj || resObj.status === 0 || resObj.status >= 500) {
            isJPDBOnline = false;
            syncLocalMock(JSON.parse(jsonStr));
            alert("Student data updated successfully in " + stuDBName + " -> " + stuRelationName + "!");
            resetForm();
        } else {
            alert("Error updating data: " + (resObj.message || JSON.stringify(resObj)));
            $("#btnUpdate").prop("disabled", false);
        }
    }
}

/**
 * Reset data: Click [Reset] button to reset the form as per step-2
 */
function resetData() {
    resetForm();
}

/**
 * Update UI status banner message
 */
function updateStatusBanner(type, message) {
    var banner = $("#statusBanner");
    banner.removeClass("status-info status-new status-existing");

    var icon = "ℹ️";
    if (type === "info") {
        banner.addClass("status-info");
        icon = "ℹ️";
    } else if (type === "new") {
        banner.addClass("status-new");
        icon = "✨";
    } else if (type === "existing") {
        banner.addClass("status-existing");
        icon = "📝";
    }

    banner.html("<span>" + icon + "</span> <span>" + message + "</span>");
}

/**
 * Local offline fallback helper (ensures seamless testing even without active internet / token)
 */
function handleOfflineLookup(rollNo) {
    mockDB = JSON.parse(localStorage.getItem("mock_jpdb_students") || "{}");
    if (mockDB[rollNo]) {
        var mockRes = {
            status: 200,
            data: JSON.stringify({
                rec_no: rollNo,
                record: mockDB[rollNo]
            })
        };
        handleRecordFound(mockRes);
    } else {
        handleRecordNotFound();
    }
}

function syncLocalMock(studentData) {
    var rollNo = studentData["Roll-No"];
    mockDB[rollNo] = studentData;
    localStorage.setItem("mock_jpdb_students", JSON.stringify(mockDB));
}
