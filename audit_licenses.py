import httpx
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# 1. LOAD ENVIRONMENT VARIABLES
# This pulls the keys from your .env.local file so they aren't hardcoded here.
load_dotenv(dotenv_path=".env.local")

URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
API_URL = f"{URL}/rest/v1/operators"

# Define the 6 specific certification columns from your database
CERT_COLUMNS = {
    "cert_forklift": "SF 18329- Forklift",
    "cert_pe4000": "PE 4000 - 4500",
    "cert_rc5500": "RC 5500",
    "cert_sp3000": "SP 3000 - 4000",
    "cert_tsp6000": "TSP 6000",
    "cert_pw3000": "PW 3000: Electric Pallet Jack"
}

def run_audit():
    print("\n--- 🛡️ RUNNING MULTI-CERTIFICATION AUDIT ---")
    
    if not URL or not KEY:
        print("❌ Error: Supabase URL or Key not found in .env.local")
        return

    headers = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
    
    try:
        # Fetch all operators from Supabase
        response = httpx.get(API_URL, headers=headers)
        operators = response.json()
        
        today = datetime.now().date()
        warning_limit = today + timedelta(days=30)

        expired_list = []  
        warning_list = []
        total_certs_found = 0

        # Loop through every operator and check all 6 potential cert columns
        for op in operators:
            for col_id, display_name in CERT_COLUMNS.items():
                date_val = op.get(col_id)
                
                # Check if the date field is not empty in the DB
                if date_val and date_val.strip(): 
                    total_certs_found += 1
                    cert_date = datetime.strptime(date_val, '%Y-%m-%d').date()
                    entry = f"{op['name']} ({display_name})"

                    if cert_date < today:
                        expired_list.append(f"{entry} - EXPIRED ON {date_val}")
                    elif today <= cert_date <= warning_limit:
                        warning_list.append(f"{entry} - EXPIRES ON {date_val}")

        # --- SETUP ARCHIVE ---
        folder_name = "Audit_Logs"
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)

        # --- GENERATE REPORT ---
        report_date = datetime.now().strftime('%Y-%m-%d')
        filename = f"Full_Audit_{report_date}.txt"
        file_path = os.path.join(folder_name, filename) 
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"OFFICIAL MULTI-CERT COMPLIANCE REPORT\n")
            f.write(f"Date: {datetime.now().strftime('%B %d, %Y - %I:%M %p')}\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"📊 TOTAL CERTIFICATIONS SCANNED: {total_certs_found}\n")
            f.write(f"🚨 CRITICAL EXPIRATIONS: {len(expired_list)}\n")
            f.write(f"⚠️ UPCOMING EXPIRATIONS: {len(warning_list)}\n\n")
            
            if expired_list:
                f.write("🚨 STOP WORK IMMEDIATELY (EXPIRED):\n")
                for item in expired_list: f.write(f" [ ] {item}\n")
                f.write("\n")
                
            if warning_list:
                f.write("⚠️ SCHEDULE RE-TRAINING (30 DAY WINDOW):\n")
                for item in warning_list: f.write(f" [ ] {item}\n")

        print(f"✅ Success! Audit complete. Report saved in {folder_name}")

        # Auto-open the report on Windows
        if os.name == 'nt': 
            os.startfile(file_path)

    except Exception as e:
        print(f"Error during audit: {e}")

if __name__ == "__main__":
    run_audit()