import re

with open('src/pages/SpecialReservation.jsx', 'r') as f:
    content = f.read()

# Update the fetch mapping to include isRecommended and isBestseller
fetch_mapping = """        const pDefs = cat.filter(c => c.category === 'package').map(c => ({ 
          id: c.key_id, 
          name: c.name, 
          price: c.price, 
          htm: c.htm, 
          capacity: c.capacity,
          isRecommended: c.key_id.startsWith('lengkap_'),
          isBestseller: c.key_id.startsWith('konten_')
        }));
        
        // Sort addonDefs exactly as the original hardcoded list
        const desiredAddonOrder = [
          'paket_grill', 'kompor_gas', 'nesting', 'kayu_bakar', 'sleeping_bag',
          'matras_90', 'matras_180', 'lampu_tenda', 'lampu_tumblr', 'kursi_lipat',
          'meja_lipat_besi', 'kabel_roll', 'kasur', 'tiang_besi', 'tripod',
          'extra_sosis', 'extra_daging', 'extra_ayam'
        ];
        
        const aDefs = cat.filter(c => c.category === 'addon').map(c => ({ 
          id: c.key_id, 
          name: c.name, 
          price: c.price, 
          type: c.billing_type 
        })).sort((a, b) => {
          let ia = desiredAddonOrder.indexOf(a.id);
          let ib = desiredAddonOrder.indexOf(b.id);
          if(ia === -1) ia = 999;
          if(ib === -1) ib = 999;
          return ia - ib;
        });"""

content = re.sub(
    r'        const pDefs = cat\.filter\(c => c\.category === \'package\'\)\.map\(c => \(\{ id: c\.key_id, name: c\.name, price: c\.price, htm: c\.htm, htmPax: c\.htm_pax, capacity: c\.capacity \}\)\);\n        const aDefs = cat\.filter\(c => c\.category === \'addon\'\)\.map\(c => \(\{ id: c\.key_id, name: c\.name, price: c\.price, type: c\.billing_type \}\)\);',
    fetch_mapping,
    content
)

# Write back
with open('src/pages/SpecialReservation.jsx', 'w') as f:
    f.write(content)
