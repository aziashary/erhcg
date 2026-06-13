import re

with open('backend/internal/utils/seeder.go', 'r') as f:
    content = f.read()

new_catalogs = """	catalogs := []models.Catalog{
		// Packages
		{KeyID: "lengkap_4p", Name: "Paket Lengkap 4P", Category: "package", Price: 540000, Capacity: 4, HTM: "included"},
		{KeyID: "lengkap_2p", Name: "Paket Lengkap 2P", Category: "package", Price: 490000, Capacity: 2, HTM: "included"},
		{KeyID: "konten_4p", Name: "Paket Konten 4P", Category: "package", Price: 340000, Capacity: 4, HTM: "not_included"},
		{KeyID: "konten_2p", Name: "Paket Konten 2P", Category: "package", Price: 290000, Capacity: 2, HTM: "not_included"},
		{KeyID: "fullset_4p", Name: "Paket Fullset 4P", Category: "package", Price: 240000, Capacity: 4, HTM: "not_included"},
		{KeyID: "fullset_2p", Name: "Paket Fullset 2P", Category: "package", Price: 190000, Capacity: 2, HTM: "not_included"},
		{KeyID: "newyear_4p", Name: "Paket New Year 4 Orang", Category: "package", Price: 590000, Capacity: 4, HTM: "not_included"},
		{KeyID: "newyear_2p", Name: "Paket New Year 2 Orang", Category: "package", Price: 540000, Capacity: 2, HTM: "not_included"},
		{KeyID: "tenda_sendiri", Name: "Bawa Tenda Sendiri", Category: "package", Price: 0, Capacity: 999, HTM: "special"},

		// Addons
		{KeyID: "tenda", Name: "Tenda", Category: "addon", Price: 100000, BillingType: "night"},
		{KeyID: "flysheet", Name: "Flysheet", Category: "addon", Price: 35000, BillingType: "night"},
		{KeyID: "paket_grill", Name: "Paket Grill", Category: "addon", Price: 130000, BillingType: "flat"},
		{KeyID: "kompor_portable", Name: "Kompor Portable", Category: "addon", Price: 30000, BillingType: "night"},
		{KeyID: "gas", Name: "Gas", Category: "addon", Price: 20000, BillingType: "flat"},
		{KeyID: "nesting", Name: "Nesting", Category: "addon", Price: 30000, BillingType: "night"},
		{KeyID: "kayu_bakar", Name: "Kayu Bakar", Category: "addon", Price: 35000, BillingType: "flat"},
		{KeyID: "sleeping_bag", Name: "Sleeping Bag", Category: "addon", Price: 15000, BillingType: "night"},
		{KeyID: "matras_90", Name: "Matras 90x180", Category: "addon", Price: 10000, BillingType: "night"},
		{KeyID: "matras_180", Name: "Matras 180x180", Category: "addon", Price: 20000, BillingType: "night"},
		{KeyID: "lampu_tenda", Name: "Lampu Tenda", Category: "addon", Price: 15000, BillingType: "night"},
		{KeyID: "lampu_tumblr", Name: "Lampu Tumblr", Category: "addon", Price: 25000, BillingType: "night"},
		{KeyID: "kursi_lipat", Name: "Kursi Lipat", Category: "addon", Price: 20000, BillingType: "night"},
		{KeyID: "meja_lipat_besi", Name: "Meja Lipat Besi", Category: "addon", Price: 35000, BillingType: "night"},
		{KeyID: "kabel_roll", Name: "Kabel Roll", Category: "addon", Price: 30000, BillingType: "night"},
		{KeyID: "kasur", Name: "Kasur", Category: "addon", Price: 35000, BillingType: "night"},
		{KeyID: "tiang_besi", Name: "Tiang Besi", Category: "addon", Price: 5000, BillingType: "night"},
		{KeyID: "tripod", Name: "Tripod", Category: "addon", Price: 30000, BillingType: "night"},
		{KeyID: "extra_sosis", Name: "Extra Sosis", Category: "addon", Price: 15000, BillingType: "flat"},
		{KeyID: "extra_daging", Name: "Extra Daging Slice", Category: "addon", Price: 80000, BillingType: "flat"},
		{KeyID: "extra_ayam", Name: "Extra Ayam Fillet", Category: "addon", Price: 38000, BillingType: "flat"},
	}"""

content = re.sub(
    r'	catalogs := \[\]models\.Catalog\{.*?	\}',
    new_catalogs,
    content,
    flags=re.DOTALL
)

with open('backend/internal/utils/seeder.go', 'w') as f:
    f.write(content)
