/**
 * Migration script: Convert UTC dates to local time
 * 
 * Usage:
 * 1. Open any page of the app in the browser (e.g. index.html)
 * 2. Make sure you're logged in and Firebase is initialized
 * 3. Open browser console (F12 → Console)
 * 4. Paste this entire script and press Enter
 * 5. It will show progress and results
 */

(async function migrateUTCtoLocal() {
  var db = firebase.firestore();
  var updated = 0;
  var skipped = 0;
  var errors = 0;

  function convertDate(val) {
    if (!val || typeof val !== 'string') return { value: val, changed: false };
    // Only convert UTC strings (ending with Z or +/- offset)
    if (!val.endsWith('Z') && !val.match(/[+-]\d{2}:\d{2}$/)) return { value: val, changed: false };
    var d = new Date(val);
    if (isNaN(d.getTime())) return { value: val, changed: false };
    // Convert to local ISO string (no Z)
    var y = d.getFullYear();
    var m = String(d.getMonth()+1).padStart(2,'0');
    var day = String(d.getDate()).padStart(2,'0');
    var h = String(d.getHours()).padStart(2,'0');
    var mi = String(d.getMinutes()).padStart(2,'0');
    var s = String(d.getSeconds()).padStart(2,'0');
    var ms = String(d.getMilliseconds()).padStart(3,'0');
    return { value: y+'-'+m+'-'+day+'T'+h+':'+mi+':'+s+'.'+ms, changed: true };
  }

  function processDoc(doc) {
    var data = doc.data();
    var updates = {};
    var fields = ['date', 'paidAt', 'openedAt', 'closedAt', 'checkIn', 'checkOut', 'settledAt'];
    
    fields.forEach(function(field) {
      if (data[field]) {
        var result = convertDate(data[field]);
        if (result.changed) {
          updates[field] = result.value;
        }
      }
    });

    // Also check nested items for dates (rare but possible)
    // And check audit logs subcollection

    return updates;
  }

  async function migrateCollection(collectionName) {
    console.log('[Migrate] Processing: ' + collectionName);
    var snapshot = await db.collection(collectionName).get();
    var batch = db.batch();
    var batchCount = 0;
    var collectionUpdated = 0;

    for (var i = 0; i < snapshot.docs.length; i++) {
      var doc = snapshot.docs[i];
      var updates = processDoc(doc);

      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
        batchCount++;
        collectionUpdated++;

        // Firestore batch limit is 500
        if (batchCount >= 500) {
          await batch.commit();
          console.log('[Migrate]   Committed batch of ' + batchCount + ' docs');
          batch = db.batch();
          batchCount = 0;
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log('[Migrate]   Committed final batch of ' + batchCount + ' docs');
    }

    console.log('[Migrate] ' + collectionName + ': ' + collectionUpdated + ' updated, ' + (snapshot.docs.length - collectionUpdated) + ' skipped');
    updated += collectionUpdated;
    skipped += (snapshot.docs.length - collectionUpdated);
  }

  async function migrateSubcollections() {
    // Audit logs subcollection under audit_logs
    console.log('[Migrate] Processing: audit_logs (subcollection)');
    try {
      var snapshot = await db.collectionGroup('audit_logs').get();
      var batch = db.batch();
      var batchCount = 0;
      var subUpdated = 0;

      for (var i = 0; i < snapshot.docs.length; i++) {
        var doc = snapshot.docs[i];
        var updates = processDoc(doc);
        if (Object.keys(updates).length > 0) {
          batch.update(doc.ref, updates);
          batchCount++;
          subUpdated++;
          if (batchCount >= 500) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        }
      }
      if (batchCount > 0) await batch.commit();
      console.log('[Migrate] audit_logs: ' + subUpdated + ' updated');
      updated += subUpdated;
    } catch(e) {
      console.warn('[Migrate] audit_logs skipped:', e.message);
    }
  }

  try {
    console.log('[Migrate] Starting UTC → Local time migration...');
    console.log('[Migrate] Current local time: ' + new Date().toString());

    var collections = ['invoices', 'shifts', 'daycloses', 'attendance', 'expenses', 'incomes', 'advances', 'returns', 'products', 'employees'];
    
    for (var c = 0; c < collections.length; c++) {
      try {
        await migrateCollection(collections[c]);
      } catch(e) {
        console.warn('[Migrate] Error on ' + collections[c] + ':', e.message);
        errors++;
      }
    }

    await migrateSubcollections();

    console.log('[Migrate] ==============================');
    console.log('[Migrate] DONE!');
    console.log('[Migrate] Updated: ' + updated);
    console.log('[Migrate] Skipped: ' + skipped);
    console.log('[Migrate] Errors: ' + errors);
    console.log('[Migrate] ==============================');
    alert('تم التحويل! Updated: ' + updated + ', Skipped: ' + skipped + ', Errors: ' + errors);

  } catch(e) {
    console.error('[Migrate] Fatal error:', e);
    alert('حدث خطأ: ' + e.message);
  }
})();
