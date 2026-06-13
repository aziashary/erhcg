import re

with open('src/pages/SpecialReservation.jsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import { useState, useEffect, useMemo } from 'react';", "import { useState, useEffect, useMemo } from 'react';\nimport { Link, useLocation } from 'react-router-dom';")
content = content.replace("import { Link } from 'react-router-dom';", "")

# 2. Add lockedData parsing before form state
locked_data_code = """  const location = useLocation();
  const lockedData = useMemo(() => {
    try {
      const dataStr = new URLSearchParams(location.search).get('data');
      if (dataStr) {
        return JSON.parse(atob(dataStr));
      }
    } catch (e) {
      console.error('Failed to parse URL data', e);
    }
    return { p: {}, h: 0 };
  }, [location.search]);
"""
content = content.replace("  const [formData, setFormData] = useState({", locked_data_code + "\n  const [formData, setFormData] = useState({")

# 3. Update packages initialization
packages_init_old = """  const [packages, setPackages] = useState(
    packageDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {})
  );"""
packages_init_new = """  const [packages, setPackages] = useState(() => {
    const init = packageDefs.reduce((acc, curr) => ({ ...acc, [curr.id]: 0 }), {});
    if (lockedData && lockedData.p) {
      Object.keys(lockedData.p).forEach(id => {
        init[id] = lockedData.p[id];
      });
    }
    return init;
  });"""
content = content.replace(packages_init_old, packages_init_new)

# 4. Update handlePackageChange
handle_pkg_old = """  const handlePackageChange = (id, delta) => {
    setPackages(prev => {
      const current = prev[id];
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
    setFlysheetRemoved(false); // reset on package change
  };"""
handle_pkg_new = """  const handlePackageChange = (id, delta) => {
    setPackages(prev => {
      const current = prev[id];
      const lockedQty = (lockedData && lockedData.p && lockedData.p[id]) ? lockedData.p[id] : 0;
      const next = Math.max(lockedQty, current + delta);
      return { ...prev, [id]: next };
    });
    setFlysheetRemoved(false); // reset on package change
  };"""
content = content.replace(handle_pkg_old, handle_pkg_new)

# 5. Update summary HTM calculation
htm_old = """    const peopleAt35k = Math.min(remainingPeople, totalHtmDiscountCapacity);
    const peopleAt45k = remainingPeople - peopleAt35k;"""
htm_new = """    let peopleAt35k = Math.min(remainingPeople, totalHtmDiscountCapacity);
    const lockedHtm = (lockedData && lockedData.h) ? lockedData.h : 0;
    peopleAt35k = Math.max(lockedHtm, peopleAt35k);
    const peopleAt45k = remainingPeople - Math.min(remainingPeople, totalHtmDiscountCapacity); // Keep original logic for 45k but adjusted for 35k override
"""
content = content.replace(htm_old, htm_new)

# 6. Prevent deleting locked packages in summary
remove_btn_code = """                      {line.removable && ("""
remove_btn_new = """                      {line.removable && !(line.type === 'package' && lockedData && lockedData.p && lockedData.p[line.id] >= packages[line.id]) && ("""
content = content.replace(remove_btn_code, remove_btn_new)


# 7. Move Summary Box to top of form
# Extract summary-box div
summary_regex = re.compile(r'(<div className="summary-box">.*?</div>\s*<button type="submit")', re.DOTALL)
summary_match = summary_regex.search(content)

if summary_match:
    summary_html = summary_match.group(1).replace('<button type="submit"', '')
    # Remove from bottom
    content = content.replace(summary_match.group(1), '<button type="submit"')
    
    # Insert at top of form
    form_tag = '<form onSubmit={handleSubmit}>\n'
    content = content.replace(form_tag, form_tag + summary_html + '\n')


# 8. Remove the "Pilihan Paket" section completely from the main UI
paket_regex = re.compile(r'\{\/\* Pilihan Paket \*\/\}.*?(?=\{\/\* Addons \*\/\})', re.DOTALL)
paket_match = paket_regex.search(content)

paket_section_html = ""
if paket_match:
    paket_section_html = paket_match.group(0)
    content = content.replace(paket_section_html, "")

# 9. Modify "Sewa Alat Tambahan Lengkap" Modal to include Pilihan Paket
modal_regex = re.compile(r'(<div className="modal-header">\s*<h3>Sewa Alat Tambahan Lengkap</h3>.*?<div className="modal-body" style=\{\{ maxHeight: \'60vh\', overflowY: \'auto\' \}\}>)', re.DOTALL)
modal_match = modal_regex.search(content)

if modal_match:
    # Append the package selection HTML right inside the modal body
    new_modal_body = modal_match.group(1) + "\n              <h4 style={{marginTop: 0, marginBottom: '15px'}}>Pilihan Paket Tenda</h4>\n              " + paket_section_html + "\n              <h4 style={{marginTop: '25px', marginBottom: '15px'}}>Alat Tambahan</h4>\n"
    content = content.replace(modal_match.group(1), new_modal_body)


# Write back
with open('src/pages/SpecialReservation.jsx', 'w') as f:
    f.write(content)
print("Updated SpecialReservation.jsx")
