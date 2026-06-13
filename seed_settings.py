import re

with open('backend/internal/utils/seeder.go', 'r') as f:
    content = f.read()

# Add SeedSettings function
settings_seed = """
func SeedSettings(db *gorm.DB) {
	settings := []models.Setting{
		{Key: "whatsapp_number", Value: "6281234567890"},
		{Key: "bank_name", Value: "Bank BCA"},
		{Key: "bank_account", Value: "7361558573"},
		{Key: "bank_holder", Value: "A.n. Mochamad Azi Ashary"},
	}
	for _, setting := range settings {
		var count int64
		db.Model(&models.Setting{}).Where("key = ?", setting.Key).Count(&count)
		if count == 0 {
			db.Create(&setting)
		}
	}
}
"""

if "SeedSettings" not in content:
    content += settings_seed

# Update SeedCatalog to include descriptions
# We need to find the `catalogs := []models.Catalog{` array and replace it with updated descriptions
import json

descriptions = {
  'lengkap_4p': json.dumps(['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Tumblr', '4 Kursi & 1 Meja, Kabel Roll', 'Paket Grill & Alat Masak', 'Termasuk HTM 4 Orang & Flysheet']),
  'lengkap_2p': json.dumps(['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Tumblr', '2 Kursi & 1 Meja, Kabel Roll', 'Paket Grill & Alat Masak', 'Termasuk HTM 2 Orang & Flysheet']),
  'konten_4p': json.dumps(['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Tumblr', '4 Kursi & 1 Meja', 'Kabel Roll & Tripod', '*Belum termasuk HTM & flysheet']),
  'konten_2p': json.dumps(['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Tumblr', '2 Kursi & 1 Meja', 'Kabel Roll & Tripod', '*Belum termasuk HTM & flysheet']),
  'fullset_4p': json.dumps(['Tenda 4P, 4 SB, 4 Matras 90x180', 'Lampu tenda & Kabel Roll', '*Belum termasuk HTM & flysheet']),
  'fullset_2p': json.dumps(['Tenda 2P, 2 SB, 2 Matras 90x180', 'Lampu tenda & Kabel Roll', '*Belum termasuk HTM & flysheet']),
  'tenda_sendiri': json.dumps(['Hanya menyewa tempat saja', '*Harus bawa perlengkapan camping sendiri']),
}

# Regex to match each package block: {KeyID: "lengkap_4p", ...}
for key, desc in descriptions.items():
    # Replace `{KeyID: "lengkap_4p", Name: "Paket Lengkap 4P", Category: "package", Price: 680000, HTM: "included", Capacity: 4}` 
    # with `{KeyID: "lengkap_4p", Name: "Paket Lengkap 4P", Category: "package", Price: 680000, HTM: "included", Capacity: 4, Description: desc}`
    
    # We can match {KeyID: "key_name", ... }
    pattern = r'(\{KeyID:\s*"' + key + r'".*?Capacity:\s*\d+)'
    
    # First we clean up any existing Description if it exists
    clean_pattern = r'(\{KeyID:\s*"' + key + r'".*?Capacity:\s*\d+)(,\s*Description:\s*`.*?`)?(\})'
    
    def repl(m):
        return m.group(1) + ', Description: `' + desc + '`}'
        
    content = re.sub(clean_pattern, repl, content)

with open('backend/internal/utils/seeder.go', 'w') as f:
    f.write(content)
