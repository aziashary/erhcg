import re
import os

files_to_update = ['src/pages/CheckReservation.jsx', 'src/pages/Home.jsx', 'src/components/Footer.jsx']

for filename in files_to_update:
    if not os.path.exists(filename):
        continue
        
    with open(filename, 'r') as f:
        content = f.read()

    # Add import for useSettings
    if 'useSettings' not in content:
        if 'react-router-dom' in content:
            content = re.sub(
                r"(import.*?from 'react-router-dom';)", 
                r"\1\nimport { useSettings } from '../context/SettingsContext';", 
                content
            )
        else:
            content = re.sub(
                r"(import React.*?from 'react';|import { useState.*?from 'react';)", 
                r"\1\nimport { useSettings } from '../context/SettingsContext';", 
                content
            )

    # Add useSettings hook inside component
    if 'const { settings } = useSettings();' not in content:
        # Match function declarations
        content = re.sub(
            r'(export default function \w+\(\) \{\n|const \w+ = \(\) => \{\n)', 
            r'\1  const { settings } = useSettings();\n', 
            content
        )

    # Replace hardcoded whatsapp number in hrefs
    content = re.sub(r'wa\.me/6281234567890', r'wa.me/${settings.whatsapp_number}', content)

    # Replace Bank Rekening Data in CheckReservation
    if 'CheckReservation' in filename:
        content = re.sub(r'<div className="bank-label">Bank BCA</div>', r'<div className="bank-label">{settings.bank_name}</div>', content)
        content = re.sub(r'<div className="norek">7361558573</div>', r'<div className="norek">{settings.bank_account}</div>', content)
        content = re.sub(r'<div className="an">A\.n\. Mochamad Azi Ashary</div>', r'<div className="an">{settings.bank_holder}</div>', content)
        content = re.sub(r"navigator\.clipboard\.writeText\('7361558573'\);", r"navigator.clipboard.writeText(settings.bank_account);", content)

    with open(filename, 'w') as f:
        f.write(content)
