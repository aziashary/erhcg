import re
import os

files_to_update = ['src/pages/Reservation.jsx', 'src/pages/SpecialReservation.jsx']

for filename in files_to_update:
    if not os.path.exists(filename):
        continue
        
    with open(filename, 'r') as f:
        content = f.read()

    # 1. Add import for useSettings
    if 'useSettings' not in content:
        content = re.sub(
            r"(import React.*?from 'react';|import { useState.*?from 'react';)", 
            r"\1\nimport { useSettings } from '../context/SettingsContext';", 
            content
        )

    # 2. Add useSettings hook inside component
    if 'const { settings } = useSettings();' not in content:
        content = re.sub(
            r'(export default function \w+\(\) \{\n)', 
            r'\1  const { settings } = useSettings();\n', 
            content
        )

    # 3. Add p.description to the fetch mapping
    if 'description: c.description' not in content:
        content = content.replace(
            "capacity: c.capacity,",
            "capacity: c.capacity,\n          description: c.description,"
        )

    # 4. Remove the hardcoded paketDetails array if it exists
    content = re.sub(r'const paketDetails = \{.*?\n\};\n', '', content, flags=re.DOTALL)

    # 5. Update the modal render logic to parse JSON description
    modal_old = r"\{paketDetails\[activeInfoPaket\]\.items\.map\(\(item, idx\) => <li key=\{idx\}>\{item\}</li>\)\}"
    modal_new = r"""{(() => {
                  const pDef = packageDefs.find(p => p.id === activeInfoPaket);
                  if (!pDef || !pDef.description) return <li>Detail tidak tersedia</li>;
                  try {
                    const items = JSON.parse(pDef.description);
                    return items.map((item, idx) => <li key={idx}>{item}</li>);
                  } catch(e) {
                    return <li>{pDef.description}</li>;
                  }
                })()}"""
    content = re.sub(modal_old, modal_new, content)
    
    # Update title in modal
    content = re.sub(
        r"<h3>\{paketDetails\[activeInfoPaket\]\.title\}</h3>", 
        r"<h3>{packageDefs.find(p => p.id === activeInfoPaket)?.name}</h3>", 
        content
    )

    # 6. Replace hardcoded whatsapp number in hrefs
    content = re.sub(r'wa\.me/6281234567890', r'wa.me/${settings.whatsapp_number}', content)

    # 7. Replace Bank Rekening Data
    content = re.sub(r'<div className="bank-label">Bank BCA</div>', r'<div className="bank-label">{settings.bank_name}</div>', content)
    content = re.sub(r'<div className="norek">7361558573</div>', r'<div className="norek">{settings.bank_account}</div>', content)
    content = re.sub(r'<div className="an">A\.n\. Mochamad Azi Ashary</div>', r'<div className="an">{settings.bank_holder}</div>', content)
    content = re.sub(r"navigator\.clipboard\.writeText\('7361558573'\);", r"navigator.clipboard.writeText(settings.bank_account);", content)

    with open(filename, 'w') as f:
        f.write(content)
