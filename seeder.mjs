
async function seedReservations() {
  const areasCapacities = {
    'Area 1': 3, 'Area 2': 5, 'Area 3': 5, 'Area 4': 3, 'Area 4 Samping': 1,
    'Area 5': 2, 'Area 6': 2, 'Area 7': 2, 'Area 8': 3, 'Campervan': 3
  };
  
  const currentAreaTents = {
    'Area 1': 0, 'Area 2': 0, 'Area 3': 0, 'Area 4': 0, 'Area 4 Samping': 0,
    'Area 5': 0, 'Area 6': 0, 'Area 7': 0, 'Area 8': 0, 'Campervan': 0
  };
  
  const areasPool = Object.keys(areasCapacities);
  
  const realNames = [
    'Budi Santoso', 'Siti Aminah', 'Rina Wati', 'Ahmad Hidayat', 'Dewi Lestari',
    'Andi Wijaya', 'Sri Rahayu', 'Eko Prasetyo', 'Nia Ramadhani', 'Rizky Firmansyah',
    'Fitriani', 'Agus Setiawan', 'Indra Hermawan', 'Putri Ayu', 'Muhammad Rizki',
    'Yudi Pratama', 'Sari Mulyani', 'Fajar Sidik', 'Ratna Kartika', 'Wahyu Saputra',
    'Dian Sastro', 'Bambang Pamungkas', 'Nadia Safitri', 'Aditya Nugroho', 'Maya Indah'
  ];
  
  const catalogRes = await fetch('http://localhost:8000/api/catalogs');
  const catalogData = await catalogRes.json();
  const catalog = catalogData.data || [];
  
  // Filter out tenda_sendiri and newyear packages
  const packagesPool = catalog.filter(c => c.category === 'package' && c.key_id !== 'tenda_sendiri' && !c.key_id.includes('newyear'));
  const addonsPool = catalog.filter(c => c.category === 'addon');
  const tendaSendiriPkg = catalog.find(c => c.key_id === 'tenda_sendiri');

  let nameIndex = 0;

  const generateData = async (status, isLunas) => {
    // Generate some records
    for (let i = 1; i <= 8; i++) {
      const isTendaSendiri = i % 3 === 0; 
      
      const checkinDate = '2026-06-13';
      const checkoutDate = '2026-06-14';

      let paketText = '';
      let basePrice = 0;
      let totalTents = isTendaSendiri ? (Math.floor(Math.random() * 2) + 1) : (Math.floor(Math.random() * 2) + 1);
      
      // Find an area that can fit totalTents
      let availableAreas = areasPool.filter(a => (currentAreaTents[a] + totalTents) <= areasCapacities[a]);
      if (availableAreas.length === 0) {
        // If no area can fit the random totalTents, just skip
        continue;
      }
      
      const area = availableAreas[Math.floor(Math.random() * availableAreas.length)];
      currentAreaTents[area] += totalTents;

      let items = [];
      let totalHtmIncluded = 0;
      let totalHtmDiscountCapacity = 0;
      let hasKontenOrFullset = false;

      let pkgCap = 0;

      if (isTendaSendiri && tendaSendiriPkg) {
        paketText = `Bawa Tenda Sendiri (${totalTents} Tenda)`;
        basePrice = 0; 
        pkgCap = totalTents * 2; 
        items.push({
          id: tendaSendiriPkg.key_id,
          name: tendaSendiriPkg.name,
          type: 'package',
          quantity: totalTents,
          price: 0,
          subtotal: 0
        });
      } else {
        const selectedPkg = packagesPool[Math.floor(Math.random() * packagesPool.length)];
        paketText = `${totalTents}x ${selectedPkg.name}`;
        basePrice = selectedPkg.price * totalTents;
        pkgCap = (selectedPkg.capacity || 2) * totalTents;

        items.push({
          id: selectedPkg.key_id,
          name: selectedPkg.name,
          type: 'package',
          quantity: totalTents,
          price: selectedPkg.price,
          subtotal: basePrice
        });

        if (['konten_4p', 'fullset_4p', 'konten_2p', 'fullset_2p'].includes(selectedPkg.key_id)) {
          hasKontenOrFullset = true;
        }

        if (selectedPkg.htm === 'included') {
          totalHtmIncluded += (totalTents * selectedPkg.capacity);
          totalHtmDiscountCapacity += (totalTents * 1); 
        } else if (selectedPkg.htm === 'not_included') {
          totalHtmDiscountCapacity += (totalTents * (selectedPkg.capacity + 1));
        }
      }

      const dewasa = pkgCap; 
      const anak = 0;

      const remainingPeople = Math.max(0, dewasa - totalHtmIncluded);
      const peopleAt35k = Math.min(remainingPeople, totalHtmDiscountCapacity);
      const peopleAt45k = remainingPeople - peopleAt35k;

      let htmTotal = 0;

      if (peopleAt35k > 0) {
        const t = peopleAt35k * 35000;
        htmTotal += t;
        items.push({
          id: 'htm_paket',
          name: 'Htm Paket',
          type: 'htm',
          quantity: peopleAt35k,
          price: 35000,
          subtotal: t
        });
      }

      if (peopleAt45k > 0) {
        const t = peopleAt45k * 45000;
        htmTotal += t;
        items.push({
          id: 'htm_tenda_sendiri',
          name: 'Htm Tenda Sendiri',
          type: 'htm',
          quantity: peopleAt45k,
          price: 45000,
          subtotal: t
        });
      }

      let addonsTotal = 0;
      let addonsTextArr = [];
      
      if (hasKontenOrFullset) {
        const flysheetSubtotal = totalTents * 35000;
        addonsTotal += flysheetSubtotal;
        addonsTextArr.push(`${totalTents}x Flysheet`);
        items.push({
          id: 'flysheet',
          name: 'Flysheet',
          type: 'addon',
          quantity: totalTents,
          price: 35000,
          subtotal: flysheetSubtotal
        });
      }

      const numAddons = Math.floor(Math.random() * 3) + 1; 
      for(let j=0; j<numAddons; j++) {
        const addon = addonsPool[Math.floor(Math.random() * addonsPool.length)];
        if (!items.find(it => it.id === addon.key_id)) {
           const qty = Math.floor(Math.random() * 2) + 1;
           const subtotal = addon.price * qty;
           addonsTotal += subtotal;
           addonsTextArr.push(`${qty}x ${addon.name}`);
           items.push({
             id: addon.key_id,
             name: addon.name,
             type: 'addon',
             quantity: qty,
             price: addon.price,
             subtotal: subtotal
           });
        }
      }

      const totalNum = basePrice + addonsTotal + htmTotal;
      const totalStr = 'Rp ' + totalNum.toLocaleString('id-ID');

      const customerName = realNames[nameIndex % realNames.length];
      const emailName = customerName.toLowerCase().replace(/\s+/g, '');
      
      // Setup DPAmount based on isLunas flag
      // If Confirmed and not Lunas, it means DP. So dpAmount = 100000.
      // If Confirmed and Lunas, dpAmount = 0.
      let dpAmt = 0;
      if (status === 'Confirmed' && !isLunas) {
        dpAmt = 100000; // Just an example DP
      }

      const payload = {
        nama: customerName,
        wa: `08123000${nameIndex.toString().padStart(4, '0')}`,
        email: `${emailName}@gmail.com`,
        dewasa: dewasa,
        anak: anak,
        motor: Math.floor(Math.random() * 2),
        mobil: Math.floor(Math.random() * 2),
        checkin: checkinDate,
        checkout: checkoutDate, 
        jamKedatangan: '14:00',
        nights: 1,
        area: area,
        paketText: paketText,
        addonsText: addonsTextArr.join(', '),
        total: totalStr,
        totalTents: totalTents,
        items: items,
        status: status,
        dpAmount: dpAmt,
        discount: 0
      };

      try {
        const res = await fetch('http://localhost:8000/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(`[${status}] Reservation for ${customerName} (Area: ${area}, Tents: ${totalTents}, Lunas: ${isLunas}) created:`, data.booking_code || data.error);
      } catch (err) {
        console.error(`Error creating [${status}] reservation for ${customerName}:`, err);
      }
      
      nameIndex++;
    }
  };

  // Run seeder:
  // 1 batch of Confirmed DP
  await generateData('Confirmed', false);
  // 1 batch of Confirmed Lunas
  await generateData('Confirmed', true);
  // 1 batch of Menunggu Konfirmasi (Pending)
  await generateData('Menunggu Konfirmasi', false);
  
  console.log('Final Tents per area:', currentAreaTents);
}

seedReservations();
