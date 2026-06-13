import requests
import json
import uuid
import random
import time

url = "http://localhost:8000/api/reservations"

first_names = ["Budi", "Siti", "Agus", "Dewi", "Andi", "Rini", "Hadi", "Lia", "Eko", "Maya", "Rudi", "Nina", "Dedi", "Ayu", "Iwan", "Tari"]
last_names = ["Santoso", "Wijaya", "Kusuma", "Pratama", "Putra", "Sari", "Hidayat", "Lestari", "Setiawan", "Rahayu"]

for i in range(20):
    nama = f"{random.choice(first_names)} {random.choice(last_names)}"
    
    # Ensure at least one has "tenda_sendiri" (we'll make the first one tenda sendiri)
    if i == 0:
        items = [{"id": "tenda_sendiri", "name": "Bawa Tenda Sendiri", "type": "package", "quantity": 1, "price": 0}]
        dewasa = random.randint(2, 6)
        area = "Area 2"
        paket_text = "Bawa Tenda Sendiri x1"
        total = 0 # HTM is calculated by backend, or we can mock it here
        html_lines = [{"id": "tenda_sendiri", "type": "package", "label": "Bawa Tenda Sendiri (1x)", "val": 0, "removable": True}]
    else:
        pkg_type = random.choice(['lengkap_4', 'konten_4', 'fullset_4'])
        pkg_price = 350000 if pkg_type == 'lengkap_4' else 250000
        items = [{"id": pkg_type, "name": f"Paket {pkg_type.replace('_4', '')} (Kapasitas 4)", "type": "package", "quantity": 1, "price": pkg_price}]
        dewasa = 4
        area = random.choice(["Area 1", "Area 3", "Area 4", "Area 5", "Area 8"])
        paket_text = f"Paket {pkg_type.replace('_4', '')} (Kapasitas 4) x1"
        total = pkg_price
        html_lines = [{"id": pkg_type, "type": "package", "label": f"{paket_text}", "val": pkg_price, "removable": True}]
        
    payload = {
        "nama": nama,
        "wa": f"08{random.randint(1000000000, 9999999999)}",
        "email": f"test_{i}@example.com",
        "dewasa": dewasa,
        "anak": random.randint(0, 2),
        "motor": random.randint(0, 2),
        "mobil": random.randint(0, 1),
        "checkin": "2026-06-11",
        "checkout": "2026-06-15",
        "jamKedatangan": "14:00",
        "area": area,
        "nights": 4,
        "paketText": paket_text,
        "addonsText": "",
        "packageName": paket_text,
        "total": str(total + (dewasa * 35000)), # mock total
        "totalTents": 1,
        "items": items,
        "summary": {
            "htmlLines": html_lines,
            "total": total + (dewasa * 35000)
        }
    }
    
    print(f"Submitting reservation {i+1} for {nama}...")
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code in [200, 201]:
            print(f"✅ Success {i+1}")
        else:
            print(f"❌ Failed {i+1}:", response.text)
    except Exception as e:
        print(f"Error {i+1}: {e}")
        
    time.sleep(0.5)

print("Done creating 20 reservations!")
