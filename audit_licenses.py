import httpx
import os
from datetime import datetime, timedelta

# 1. YOUR CONNECTION KEYS
URL = "https://mvywknmklwlnkoxkqzqy.supabase.co"
KEY = "sb_publishable_JMr8QsUTfhoK1g2pBRXgIA_FVn5XEOA"

API_URL = f"{URL}/rest/v1/operators"

def run_audit():
    print("\n--- 🛡️ RUNNING OPERATOR LICENSE AUDIT ---")
    
    headers = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
    
    try:
        # Ask the database for the list
        response = httpx.get(API_URL, headers=headers)
        operators = response.json()
        
        today = datetime.now().date()
        warning_limit = today + timedelta(days=30)

        # Categorize the data
        expired = [o['name'] for o in operators if datetime.strptime(o['expiry_date'], '%Y-%m-%d').date() < today]
        warning = [o['name'] for o in operators if today <= datetime.strptime(o['expiry_date'], '%Y-%m-%d').date() <= warning_limit]
        safe_count = len(operators) - len(expired) - len(warning)

        # --- 2. SETUP THE ARCHIVE FOLDER ---
        folder_name = "Audit_Logs"
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)
            print(f"Created new folder: {folder_name}")

        # --- 3. GENERATE THE TEXT FILE REPORT ---
        report_date = datetime.now().strftime('%Y-%m-%d')
        filename = f"Audit_Report_{report_date}.txt"
        file_path = os.path.join(folder_name, filename) # Puts file inside the folder
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"OFFICIAL LICENSING AUDIT REPORT\n")
            f.write(f"Date: {datetime.now().strftime('%B %d, %Y - %I:%M %p')}\n")
            f.write("=" * 40 + "\n\n")
            f.write(f"✅ COMPLIANT OPERATORS: {safe_count}\n")
            f.write(f"⚠️ EXPIRING WITHIN 30 DAYS: {len(warning)}\n")
            f.write(f"🚨 EXPIRED / ILLEGAL TO OPERATE: {len(expired)}\n\n")
            
            if expired:
                f.write("🚨 CRITICAL: STOP WORK IMMEDIATELY FOR:\n")
                for name in expired: f.write(f" - {name}\n")
                f.write("\n")
                
            if warning:
                f.write("⚠️ SCHEDULE RE-TRAINING FOR:\n")
                for name in warning: f.write(f" - {name}\n")

        print(f"✅ Success! Report archived in {folder_name} as: {filename}")

        # --- 4. AUTOMATICALLY OPEN THE FILE ---
        os.startfile(file_path)

    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    run_audit()