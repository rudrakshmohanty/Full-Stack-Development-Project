
import requests
import json

BASE_URL = "http://localhost:5001/api"

def test_register_user(username, email, password):
    payload = {
        "username": username,
        "email": email,
        "password": password
    }
    r = requests.post(f"{BASE_URL}/register", json=payload)
    print(f"Register {username}:", r.status_code, r.json())
    return r

def test_login_user(email, password):
    payload = {
        "email": email,
        "password": password
    }
    r = requests.post(f"{BASE_URL}/login", json=payload)
    print(f"Login {email}:", r.status_code, r.json())
    return r.json().get("token")

def test_create_credential(token, recipient_email, cred_type="Diploma", data=None):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "recipient_email": recipient_email,
        "credential_type": cred_type,
        "title": "Test Credential Title",
        "data": data or {"field": "value"}
    }
    r = requests.post(f"{BASE_URL}/credentials", json=payload, headers=headers)
    print("Create Credential:", r.status_code, r.json())
    return r.json().get("credential_id")

def test_verify_credential(credential_id):
    r = requests.get(f"{BASE_URL}/verify/{credential_id}")
    print("Verify Credential:", r.status_code, r.json())

def test_list_credentials(token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/credentials", headers=headers)
    print("List Credentials:", r.status_code, r.json())

def test_negative_login():
    print("Negative Login Test:")
    token = test_login_user("wrong@example.com", "wrongpass")
    print("Token should be None:", token)

def test_negative_credential_creation(token):
    print("Negative Credential Creation Test:")
    cred_id = test_create_credential(token, "nonexistent@example.com")
    print("Credential ID should be None or error:", cred_id)

def test_admin_routes():
    print("\n--- Admin Route Tests ---")
    try:
        admin_email = "admin@example.com"
        admin_pass = "adminpass123"
        reg = test_register_user("admin", admin_email, admin_pass)
        admin_token = test_login_user(admin_email, admin_pass)
        # Assign admin role if not set
        if admin_token:
            headers = {"Authorization": f"Bearer {admin_token}"}
            # Try to update own role to admin (if endpoint exists)
            # Find admin user id
            user_id = None
            try:
                r_users = requests.get(f"{BASE_URL}/admin/users", headers=headers)
                print("Admin - List Users:", r_users.status_code, r_users.json())
                users = r_users.json().get("users", [])
                for u in users:
                    if u.get("email") == admin_email:
                        user_id = u.get("_id")
                        break
                if user_id:
                    r_update = requests.put(f"{BASE_URL}/admin/users/{user_id}", json={"role": "admin"}, headers=headers)
                    print("Admin - Update Own Role:", r_update.status_code, r_update.json())
                    # Check if role is updated
                    updated_user = r_update.json().get("user")
                    if updated_user:
                        print(f"Updated user role: {updated_user.get('role')}")
            except Exception as e:
                print("Admin user update error:", e)
    except Exception as e:
        print("Admin route test error:", e)

def test_analytics():
    print("\n--- Analytics Endpoint Tests ---")
    try:
        # Use admin token for analytics endpoints
        admin_email = "admin@example.com"
        admin_pass = "adminpass123"
        admin_token = test_login_user(admin_email, admin_pass)
        if admin_token:
            headers = {"Authorization": f"Bearer {admin_token}"}
            r = requests.get(f"{BASE_URL}/analytics/overview", headers=headers)
            print("Analytics Overview:", r.status_code, r.json())
            r2 = requests.get(f"{BASE_URL}/analytics/credentials", headers=headers)
            print("Analytics Credentials:", r2.status_code, r2.json())
        else:
            print("Analytics: Admin token not available.")
    except Exception as e:
        print("Analytics test error:", e)

def test_notifications(token):
    print("\n--- Notifications Endpoint Tests ---")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/notifications", headers=headers)
        print("List Notifications:", r.status_code, r.json())
        # Mark notification as read (example)
        # if r.json().get("notifications"):
        #     notif_id = r.json()["notifications"][0]["_id"]
        #     r2 = requests.put(f"{BASE_URL}/notifications/{notif_id}", headers=headers)
        #     print("Mark Notification Read:", r2.status_code, r2.json())
    except Exception as e:
        print("Notifications test error:", e)

if __name__ == "__main__":
    # Register issuer and recipient
    issuer_email = "issuer@example.com"
    issuer_pass = "issuerpass123"
    recipient_email = "recipient@example.com"
    recipient_pass = "recipientpass123"

    test_register_user("issuer", issuer_email, issuer_pass)
    test_register_user("recipient", recipient_email, recipient_pass)

    # Login issuer and recipient
    issuer_token = test_login_user(issuer_email, issuer_pass)
    recipient_token = test_login_user(recipient_email, recipient_pass)

    # Negative login test
    test_negative_login()

    # Issuer creates credential for recipient
    if issuer_token and recipient_token:
        cred_id = test_create_credential(issuer_token, recipient_email)
        test_list_credentials(issuer_token)
        test_list_credentials(recipient_token)
        if cred_id:
            test_verify_credential(cred_id)
    # Negative credential creation
    if issuer_token:
        test_negative_credential_creation(issuer_token)

    # Admin, analytics, notifications tests
    test_admin_routes()
    test_analytics()
    if issuer_token:
        test_notifications(issuer_token)
    if recipient_token:
        test_notifications(recipient_token)
