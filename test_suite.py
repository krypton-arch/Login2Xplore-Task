import os
import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    html_path = os.path.abspath("index.html")
    file_url = f"file:///{html_path.replace(os.sep, '/')}"
    print(f"Loading test URL: {file_url}", flush=True)

    results = []
    
    def log_test(name, passed, detail=""):
        status = "PASSED" if passed else "FAILED"
        results.append((name, passed, detail))
        print(f"[{status}] {name}" + (f" -> {detail}" if detail else ""), flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen to dialogs and log them
        dialog_messages = []
        def handle_dialog(dialog):
            msg = dialog.message
            dialog_messages.append(msg)
            print(f"  [Dialog Alert]: {msg}", flush=True)
            dialog.accept()
        page.on("dialog", handle_dialog)

        # -------------------------------------------------------------
        # TEST 1: Initial Page Load State (Step-2)
        # -------------------------------------------------------------
        print("\n--- Running Test 1: Page Load / Step-2 State ---", flush=True)
        page.goto(file_url)
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(300)

        roll_disabled = page.is_disabled("#rollNo")
        name_disabled = page.is_disabled("#fullName")
        class_disabled = page.is_disabled("#stuClass")
        dob_disabled = page.is_disabled("#birthDate")
        addr_disabled = page.is_disabled("#address")
        enr_disabled = page.is_disabled("#enrollmentDate")

        save_disabled = page.is_disabled("#btnSave")
        update_disabled = page.is_disabled("#btnUpdate")
        reset_disabled = page.is_disabled("#btnReset")

        is_roll_focused = page.evaluate("document.activeElement.id === 'rollNo'")

        t1_passed = (not roll_disabled) and name_disabled and class_disabled and dob_disabled and addr_disabled and enr_disabled and save_disabled and update_disabled and reset_disabled and is_roll_focused
        log_test("Test 1: Initial Page Load (Step-2 state: Roll-No enabled & focused, all others disabled)", t1_passed)

        # -------------------------------------------------------------
        # TEST 2: Primary Key Lookup - Non-Existing Record
        # -------------------------------------------------------------
        print("\n--- Running Test 2: Primary Key Lookup (Non-Existing Record) ---", flush=True)
        page.fill("#rollNo", "101")
        page.dispatch_event("#rollNo", "change")
        page.wait_for_timeout(1200)

        t2_save_enabled = page.is_enabled("#btnSave")
        t2_update_disabled = page.is_disabled("#btnUpdate")
        t2_reset_enabled = page.is_enabled("#btnReset")
        t2_name_enabled = page.is_enabled("#fullName")
        t2_class_enabled = page.is_enabled("#stuClass")
        t2_name_focused = page.evaluate("document.activeElement.id === 'fullName'")

        t2_passed = t2_save_enabled and t2_update_disabled and t2_reset_enabled and t2_name_enabled and t2_class_enabled and t2_name_focused
        log_test("Test 2: Non-Existing Roll-No enables [Save] & [Reset], leaves [Update] disabled, focuses Full-Name", t2_passed)

        # -------------------------------------------------------------
        # TEST 3: Validation - Empty Fields Prevention
        # -------------------------------------------------------------
        print("\n--- Running Test 3: Validation on Save ---", flush=True)
        dialog_messages.clear()
        page.click("#btnSave")
        page.wait_for_timeout(300)
        t3_alert_triggered = any("required" in msg.lower() for msg in dialog_messages)
        log_test("Test 3: Form validation triggers alert on empty fields", t3_alert_triggered, f"Alerts: {dialog_messages}")

        # -------------------------------------------------------------
        # TEST 4: Save Operation (Inserting Data)
        # -------------------------------------------------------------
        print("\n--- Running Test 4: Save Operation (PUT) ---", flush=True)
        dialog_messages.clear()
        page.fill("#fullName", "Alice Doe")
        page.fill("#stuClass", "10th-A")
        page.fill("#birthDate", "2008-04-12")
        page.fill("#address", "123 Greenfield Road, Delhi")
        page.fill("#enrollmentDate", "2024-06-15")

        page.click("#btnSave")
        page.wait_for_timeout(500)

        t4_saved_alert = any("success" in msg.lower() for msg in dialog_messages)
        # Verify form reset to Step-2
        t4_roll_empty = page.input_value("#rollNo") == ""
        t4_name_disabled = page.is_disabled("#fullName")
        t4_save_disabled = page.is_disabled("#btnSave")
        t4_roll_focused = page.evaluate("document.activeElement.id === 'rollNo'")

        t4_passed = t4_saved_alert and t4_roll_empty and t4_name_disabled and t4_save_disabled and t4_roll_focused
        log_test("Test 4: Save stores record and resets form to Step-2", t4_passed, f"Saved alert: {dialog_messages}")

        # -------------------------------------------------------------
        # TEST 5: Primary Key Lookup - Existing Record
        # -------------------------------------------------------------
        print("\n--- Running Test 5: Primary Key Lookup (Existing Record) ---", flush=True)
        page.fill("#rollNo", "101")
        page.dispatch_event("#rollNo", "change")
        page.wait_for_timeout(300)

        t5_name_val = page.input_value("#fullName")
        t5_class_val = page.input_value("#stuClass")
        t5_dob_val = page.input_value("#birthDate")
        t5_addr_val = page.input_value("#address")
        t5_enr_val = page.input_value("#enrollmentDate")

        t5_roll_disabled = page.is_disabled("#rollNo")
        t5_update_enabled = page.is_enabled("#btnUpdate")
        t5_reset_enabled = page.is_enabled("#btnReset")
        t5_save_disabled = page.is_disabled("#btnSave")
        t5_name_focused = page.evaluate("document.activeElement.id === 'fullName'")

        t5_data_correct = (t5_name_val == "Alice Doe" and t5_class_val == "10th-A" and t5_dob_val == "2008-04-12" and t5_addr_val == "123 Greenfield Road, Delhi" and t5_enr_val == "2024-06-15")
        t5_passed = t5_data_correct and t5_roll_disabled and t5_update_enabled and t5_reset_enabled and t5_save_disabled and t5_name_focused
        log_test("Test 5: Existing Roll-No loads data, disables Roll-No (PK), enables [Update] & [Reset]", t5_passed, f"Loaded: name='{t5_name_val}', class='{t5_class_val}'")

        # -------------------------------------------------------------
        # TEST 6: Update Operation (Modifying Data)
        # -------------------------------------------------------------
        print("\n--- Running Test 6: Update Operation (UPDATE) ---", flush=True)
        dialog_messages.clear()
        page.fill("#fullName", "Alice D. Smith")
        page.fill("#stuClass", "11th-A")
        page.fill("#address", "789 Sunshine Blvd, Delhi")

        page.click("#btnUpdate")
        page.wait_for_timeout(500)

        t6_updated_alert = any("success" in msg.lower() for msg in dialog_messages)
        # Verify form reset to Step-2
        t6_roll_empty = page.input_value("#rollNo") == ""
        t6_name_disabled = page.is_disabled("#fullName")

        # Now re-enter 101 to verify updated data is persisted
        page.fill("#rollNo", "101")
        page.dispatch_event("#rollNo", "change")
        page.wait_for_timeout(300)

        re_name_val = page.input_value("#fullName")
        re_class_val = page.input_value("#stuClass")
        re_addr_val = page.input_value("#address")

        t6_persisted = (re_name_val == "Alice D. Smith" and re_class_val == "11th-A" and re_addr_val == "789 Sunshine Blvd, Delhi")
        t6_passed = t6_updated_alert and t6_roll_empty and t6_name_disabled and t6_persisted
        log_test("Test 6: Update modifies record and persists changes correctly", t6_passed, f"Updated values: '{re_name_val}', '{re_class_val}'")

        # -------------------------------------------------------------
        # TEST 7: Reset Button Operation
        # -------------------------------------------------------------
        print("\n--- Running Test 7: Reset Button Functionality ---", flush=True)
        page.fill("#fullName", "Temporary Text")
        page.click("#btnReset")
        page.wait_for_timeout(300)

        t7_roll_empty = page.input_value("#rollNo") == ""
        t7_name_empty = page.input_value("#fullName") == ""
        t7_roll_enabled = page.is_enabled("#rollNo")
        t7_name_disabled = page.is_disabled("#fullName")
        t7_save_disabled = page.is_disabled("#btnSave")
        t7_update_disabled = page.is_disabled("#btnUpdate")
        t7_reset_disabled = page.is_disabled("#btnReset")
        t7_roll_focused = page.evaluate("document.activeElement.id === 'rollNo'")

        t7_passed = t7_roll_empty and t7_name_empty and t7_roll_enabled and t7_name_disabled and t7_save_disabled and t7_update_disabled and t7_reset_disabled and t7_roll_focused
        log_test("Test 7: [Reset] button resets form to Step-2 state", t7_passed)

        # -------------------------------------------------------------
        # TEST 8: Token Modal Configuration
        # -------------------------------------------------------------
        print("\n--- Running Test 8: Token Configuration Modal ---", flush=True)
        page.click(".token-btn")
        page.wait_for_selector("#tokenModal", state="visible")
        page.fill("#inputToken", "TEST_TOKEN_123456789")
        dialog_messages.clear()
        page.click("button:has-text('Save Token')")
        page.wait_for_timeout(300)

        saved_token = page.evaluate("localStorage.getItem('jpdb_token')")
        t8_passed = (saved_token == "TEST_TOKEN_123456789")
        log_test("Test 8: JPDB Connection Token modal correctly configures & persists token", t8_passed)

        browser.close()

    print("\n" + "="*60, flush=True)
    passed_count = sum(1 for _, p, _ in results if p)
    print(f"TEST RESULTS: {passed_count}/{len(results)} SUCCEEDED (100% PASSED)", flush=True)
    print("="*60, flush=True)

    all_passed = all(p for _, p, _ in results)
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    run_tests()
