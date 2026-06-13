import os
import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # If already using Swal, skip
    if 'import Swal' in content:
        return

    original = content

    # Regex to find alert('...') or alert(`...`)
    # We will replace them with Swal.fire(...)
    def replacer(match):
        msg = match.group(1)
        if 'berhasil' in msg.lower() or 'telah' in msg.lower():
            icon = 'success'
            title = 'Berhasil'
        elif 'gagal' in msg.lower() or 'error' in msg.lower():
            icon = 'error'
            title = 'Error'
        else:
            icon = 'warning'
            title = 'Perhatian'
            
        return f"Swal.fire('{title}', {msg}, '{icon}')"

    new_content = re.sub(r'alert\((.*?)\)', replacer, content)

    if new_content != original:
        # Add import at the top
        lines = new_content.split('\n')
        # find last import
        last_import = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
        
        lines.insert(last_import + 1, "import Swal from 'sweetalert2';")
        
        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))
        print(f"Updated {filepath}")

files_to_update = [
    'src/pages/dashboard/AdminPending.jsx',
    'src/pages/dashboard/AdminDeclined.jsx',
    'src/pages/dashboard/AdminCatalog.jsx',
    'src/pages/dashboard/AdminGenerateLink.jsx',
    'src/pages/Reservation.jsx',
    'src/pages/SpecialReservation.jsx'
]

for file in files_to_update:
    path = os.path.join('/Users/hary/Web-Projects/e-RHCG', file)
    if os.path.exists(path):
        update_file(path)
