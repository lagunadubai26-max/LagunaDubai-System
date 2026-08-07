const DB_MODE = 'firebase';

function localGet(key, def) {
  try { const d = localStorage.getItem('laguna_' + key); return d ? JSON.parse(d) : def; } catch { return def; }
}
function localSet(key, val) { localStorage.setItem('laguna_' + key, JSON.stringify(val)); }

function localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

const DB = {
  mode: DB_MODE,

  invoices: {
    async all() { return await FB.getCollection('invoices'); },
    async add(inv) {
      if (!inv.id) inv.id = 'INV-' + crypto.randomUUID().slice(0, 8).toUpperCase();
      return await FB.addDoc('invoices', inv);
    },
    async update(id, data) { await FB.updateDoc('invoices', id, data); },
    async remove(id) { await FB.removeDoc('invoices', id); }
  },

  employees: {
    async all() { return await FB.getCollection('employees'); },
    async add(emp) { if (!emp.id) emp.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('employees', emp); },
    async update(id, data) { await FB.updateDoc('employees', id, data); },
    async remove(id) { await FB.removeDoc('employees', id); }
  },

  attendance: {
    async all() { return await FB.getCollection('attendance'); },
    async attDayRange(now) {
      now = now || FB.clockNow();
      let shift = null;
      try { shift = await DB.shifts.getOpen(); } catch(e) {}
      if (shift && shift.openDate) {
        const start = new Date(shift.openDate + 'T00:00:00');
        return { start, end: now };
      }
      const h = now.getHours();
      let start, end;
      if (h >= 17) {
        start = new Date(now); start.setHours(17, 0, 0, 0);
        end = new Date(now); end.setDate(end.getDate() + 1); end.setHours(16, 59, 59, 999);
      } else {
        start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(17, 0, 0, 0);
        end = new Date(now); end.setHours(16, 59, 59, 999);
      }
      return { start, end };
    },
    async today() {
      const all = await FB.getCollection('attendance');
      const range = this.attDayRange();
      return all.filter(a => {
        if (!a.date) return false;
        const d = new Date(a.date);
        return d >= range.start && d <= range.end;
      });
    },
    async add(rec) { if (!rec.id) rec.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('attendance', rec); },
    async update(id, data) { await FB.updateDoc('attendance', id, data); },
    async remove(id) { await FB.removeDoc('attendance', id); },
    async checkIn(employeeId, name, job, customTime, shiftTime) {
      const time = customTime ? new Date(customTime) : FB.clockNow();
      const minutes = time.getHours() * 60 + time.getMinutes();
      let status = 'present';
      if (shiftTime) {
        const parts = String(shiftTime).split(':');
        if (parts.length >= 2) {
          const shiftMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          status = minutes > shiftMin + 30 ? 'late' : 'present';
        } else {
          status = minutes > 17 * 60 + 30 ? 'late' : 'present';
        }
      } else {
        status = minutes > 17 * 60 + 30 ? 'late' : 'present';
      }
      return await FB.addDoc('attendance', {
        id: 'att-' + crypto.randomUUID().slice(0, 8), employeeId, name, job,
        date: time.toISOString(), checkIn: time.toISOString(), status
      });
    },
    async checkOut(id, customTime) {
      const time = customTime ? new Date(customTime) : FB.clockNow();
      await FB.updateDoc('attendance', id, { checkOut: time.toISOString() });
    }
  },

  returns: {
    async all() { return await FB.getCollection('returns'); },
    async add(r) { if (!r.id) r.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('returns', r); },
    async update(id, data) { await FB.updateDoc('returns', id, data); },
    async remove(id) { await FB.removeDoc('returns', id); }
  },

  tables: {
    async all() { return await FB.getCollection('tables_'); },
    async add(t) { if (!t.id) t.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('tables_', t); },
    async update(id, data) { await FB.updateDoc('tables_', id, data); },
    async remove(id) { await FB.removeDoc('tables_', id); }
  },

  expenses: {
    async all() { return await FB.getCollection('expenses'); },
    async add(e) { if (!e.id) e.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('expenses', e); },
    async remove(id) { await FB.removeDoc('expenses', id); }
  },

  customers: {
    async all() { return await FB.getCollection('customers'); },
    async add(c) { if (!c.id) c.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('customers', c); },
    async update(id, data) { await FB.updateDoc('customers', id, data); },
    async remove(id) { await FB.removeDoc('customers', id); }
  },

  inventory: {
    async all() { return await FB.getCollection('inventory'); },
    async add(item) { if (!item.id) item.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('inventory', item); },
    async update(id, data) { await FB.updateDoc('inventory', id, data); },
    async remove(id) { await FB.removeDoc('inventory', id); }
  },

  inventory_counts: {
    async all() { return await FB.getCollection('inventory_counts'); },
    async add(c) { if (!c.id) c.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('inventory_counts', c); },
  },

  settings: {
    async get() {
      const all = await FB.getCollection('settings');
      const o = {};
      all.forEach(s => o[s.key] = s.value);
      return o;
    },
    async save(data) {
      const existing = await FB.getCollection('settings');
      for (const [key, value] of Object.entries(data)) {
        const found = existing.find(s => s.key === key);
        if (found) await FB.updateDoc('settings', found.id, { value });
        else await FB.addDoc('settings', { key, value });
      }
    }
  },

  categories: {
    async all() { return await FB.getCollection('categories'); },
    async add(c) { if (!c.id) c.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('categories', c); },
    async update(id, data) { await FB.updateDoc('categories', id, data); },
    async remove(id) { await FB.removeDoc('categories', id); }
  },

  users: {
    async all() { return await FB.getCollection('users'); },
    async add(u) { return await FB.addDoc('users', u); },
    async update(id, data) { await FB.updateDoc('users', id, data); },
    async remove(id) { await FB.removeDoc('users', id); }
  },

  daycloses: {
    async all() { return await FB.getCollection('daycloses'); },
    async today() {
      const all = await FB.getCollection('daycloses');
      const today = localDateKey(FB.clockNow());
      return all.find(d => d.date && d.date.slice(0, 10) === today);
    },
    async byMonth(year, month) {
      const all = await FB.getCollection('daycloses');
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      return all.filter(d => d.date && d.date.startsWith(prefix));
    },
    async close(data) {
      if (!data.id) data.id = 'dc-' + crypto.randomUUID().slice(0, 8);
      return await FB.addDoc('daycloses', data);
    },
  },

  shifts: {
    async all() { return await FB.getCollection('shifts'); },
    async getOpen() {
      const all = await FB.getCollection('shifts');
      return all.find(s => s && !s.closedAt) || null;
    },
    async open(name) {
      const now = FB.clockNow();
      const shift = {
        id: 'sh-' + crypto.randomUUID().slice(0, 8),
        openDate: localDateKey(now),
        openedAt: now.toISOString(),
        openedBy: name || 'الكاشير',
        closedAt: null
      };
      await FB.addDoc('shifts', shift);
      return shift;
    },
    async close(id, data) {
      await FB.updateDoc('shifts', id, data);
    }
  },

  audit: {
    async all() { return await FB.getCollection('audit_logs'); },
    async log(type, detail) {
      try {
        var user;
        try { user = JSON.parse(sessionStorage.getItem('laguna_user')); } catch(e) { user = null; }
        await FB.addDoc('audit_logs', {
          type: type,
          detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
          username: user ? user.username : 'unknown',
          role: user ? user.role : 'none',
          timestamp: FB.nowISO()
        });
      } catch(e) { console.warn('[audit]', e); }
    }
  },

  products: {
    async all() { return await FB.getCollection('products'); },
    async add(p) { if (!p.id) p.id = crypto.randomUUID().slice(0, 8); return await FB.addDoc('products', p); },
    async update(id, data) { await FB.updateDoc('products', id, data); },
    async remove(id) { await FB.removeDoc('products', id); }
  },

  async migrateProductDescriptions() {
    const descMap = {
      p88: 'برتقال - جوافة - ليمون - عسل',
      p89: 'كيوي - مانجا',
      p90: 'مانجو - جوافة - فراولة',
      p91: 'فراولة - كيوي - موز - برتقال',
      p92: 'موز - ايس كريم - مكسرات - كريمة',
      p93: 'اناناس - برتقال - خوخ',
      p94: 'مانجو - جوافة - فراولة',
      p95: 'صودا - برتقال',
      p96: 'صودا - برتقال - رمان سيرم',
      p97: 'باشون - بلوشيرم',
      p98: 'صودا - بلوبيري',
      p99: 'صودا - تفاح اخضر - كولا سيرم',
      p100: 'بريل - ليمون - نعناع',
      p101: 'اسبيرسو - رد بول',
    };
    const products = await this.products.all() || [];
    for (const p of products) {
      const desc = descMap[p.id];
      if (desc && !p.description) {
        await this.products.update(p.id, { description: desc });
      }
    }
  },

  async seed() {
    const users = await this.users.all();
    const adminUser = users.find(u => u.username === 'admin');
    if (adminUser) {
      const adminHashed = await PASSWORD_UTILS.hash('admin123');
      await this.users.update(adminUser.id, { password: adminHashed });
    } else {
      const adminHashed = await PASSWORD_UTILS.hash('admin123');
      const uid = FB.getUid();
      if (uid) {
        try {
          const snap = await FB.getDb().collection('user_mappings').doc(uid).get();
          if (!snap.exists) {
            await FB.getDb().collection('user_mappings').doc(uid).set({
              userId: 'u1', role: 'Administrator', username: 'admin', name: 'الكاشير',
              updatedAt: FB.nowISO()
            });
          }
        } catch(e) { console.warn('[seed] mapping error:', e); }
      }
      await this.users.add({ id: 'u1', username: 'admin', password: adminHashed, name: 'الكاشير', role: 'Administrator' });
    }
    const ownerUser = users.find(u => u.username === 'owner');
    if (ownerUser) {
      await this.users.remove(ownerUser.id);
    }
    console.warn('%c[seed] 👤 كاشير: admin / admin123', 'font-size:14px;font-weight:bold');

    const settings = await this.settings.get();
    if (settings._seeded) return;

    const cats = await this.categories.all();
    if (cats.length === 0) {
      const defaults = [
        { slug: 'coffee', name: 'قهوة', order: 1 },
        { slug: 'hot', name: 'مشروبات ساخنة', order: 2 },
        { slug: 'ice', name: 'آيس كوفي', order: 3 },
        { slug: 'matcha', name: 'ماتشا', order: 4 },
        { slug: 'frappe', name: 'فرابيه', order: 5 },
        { slug: 'smoothie', name: 'سموزي', order: 6 },
        { slug: 'milkshake', name: 'ميلك شيك', order: 7 },
        { slug: 'yogurt', name: 'زبادي', order: 8 },
        { slug: 'juice', name: 'عصائر فريش', order: 9 },
        { slug: 'cocktail', name: 'كوكتيلات', order: 10 },
        { slug: 'mojito', name: 'موهيتو', order: 11 },
        { slug: 'cans', name: 'كانز', order: 12 },
        { slug: 'desserts', name: 'حلويات', order: 13 }
      ];
      for (const c of defaults) {
        await this.categories.add(c);
      }
    }

    const employees = await this.employees.all();
    if (employees.length === 0) {
      await this.employees.add({ id: 'e1', name: 'أحمد موظف', job: 'ويتر', phone: '01012345678', salary: '3000', hireDate: '2025-01-15', status: 'active', pin: '1234' });
      await this.employees.add({ id: 'e2', name: 'محمد موظف', job: 'شيف', phone: '01198765432', salary: '5000', hireDate: '2025-02-01', status: 'active', pin: '5678' });
    }

    const tables = await this.tables.all();
    if (tables.length === 0) {
      for (let i = 1; i <= 12; i++) {
        await this.tables.add({ id: 't' + i, name: 'طاولة ' + i, capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6, status: 'available', currentOrder: null, hasService: i > 6 });
      }
    }

    const customers = await this.customers.all();
    if (customers.length === 0) {
      await this.customers.add({ id: 'c1', name: 'أحمد محمد', phone: '01012345678', totalSpent: 1200, visits: 15, lastVisit: FB.nowISO() });
      await this.customers.add({ id: 'c2', name: 'محمد علي', phone: '01198765432', totalSpent: 850, visits: 8, lastVisit: FB.nowISO() });
    }

    const inventory = await this.inventory.all();
    if (inventory.length === 0) {
      await this.inventory.add({ id: 'i1', name: 'قهوة تركية', category: 'قهوة', quantity: 50, unit: 'كجم', minQuantity: 10 });
      await this.inventory.add({ id: 'i2', name: 'حليب', category: 'ألبان', quantity: 30, unit: 'لتر', minQuantity: 5 });
      await this.inventory.add({ id: 'i3', name: 'سكر', category: 'مواد جافة', quantity: 100, unit: 'كجم', minQuantity: 20 });
    }

    const products = await this.products.all();
    if (products.length === 0) {
      const raw = 'p1^سنجل تركي^Single Turkish Coffee^coffee^30^images/menu/سنجل تركي.webp|p2^دبل تركي^Double Turkish Coffee^coffee^35^images/menu/دبل تركي.webp|p3^فرنساوي^French Press^coffee^45^images/menu/فرنساوي.webp|p4^قهوة نكهات^Flavored Coffee^coffee^45^images/menu/قهوة نكهات.webp|p5^نسكافية حليب^Nescafe with Milk^coffee^50^images/menu/نسكافية حليب.png|p6^سنجل اسبرسو^Single Espresso^coffee^40^images/menu/سنجل اسبرسو.webp|p7^دبل اسبرسو^Double Espresso^coffee^55^images/menu/دبل اسبرسو.webp|p8^ميكاتو^Mecato^coffee^50^images/menu/ميكاتو.png|p9^دبل ميكاتو^Double Mecato^coffee^60^images/menu/دبل ميكاتو.png|p10^امريكان كوفي^American Coffee^coffee^50^images/menu/امريكان كوفي.png|p11^لاتيه^Latte^coffee^60^images/menu/لاتيه.webp|p12^كابتشينو^Cappuccino^coffee^60^images/menu/كابتشينو.webp|p13^كابتشينو فليفر^Flavored Cappuccino^coffee^65^images/menu/كابتشينو فليفر.png|p14^دارك موكا^Dark Mocha^coffee^50^images/menu/دارك موكا.webp|p15^وايت موكا^White Mocha^coffee^59^images/menu/وايت موكا.webp|p16^كورتادو^Cortado^coffee^65^images/menu/كورتادو.webp|p17^لاتيه فليفر^Flavored Latte^coffee^65^images/menu/لاتيه فليفر.png|p18^شاي احمر^Red Tea^hot^20^images/menu/شاي احمر.webp|p19^شاي اخضر^Green Tea^hot^25^images/menu/شاي اخضر.webp|p20^شاي فواكة^Fruit Tea^hot^25^images/menu/شاي فواكة.png|p21^شاي بلبن^Tea with Milk^hot^50^images/menu/شاي بلبن.webp|p22^شاي كومبليت^Complete Tea^hot^25^images/menu/شاي كومبليت.png|p23^براد شاي^Tea Pot^hot^60^images/menu/براد شاي.webp|p24^اعشاب^Herbal Tea^hot^25^images/menu/اعشاب.webp|p25^قرفة^Cinnamon^hot^30^images/menu/قرفة.webp|p26^سحلب^Sahlab^hot^50^images/menu/سحلب.webp|p27^جنزبيل^Ginger^hot^30^images/menu/جنزبيل.png|p28^هوت سيدر^Hot Cider^hot^45^images/menu/هوت سيدر.png|p29^هوت شوكلت^Hot Chocolate^hot^50^images/menu/هوت شوكلت.webp|p30^هوت كاراميل^Hot Caramel^hot^55^images/menu/هوت كاراميل.png|p31^هوت نوتيلا^Hot Nutella^hot^55^images/menu/هوت نوتيلا.png|p32^هوت مارشملو^Hot Marshmallow^hot^55^images/menu/هوت مارشملو.png|p33^هوت اوريو^Hot Oreo^hot^55^images/menu/هوت اوريو.png|p34^آيس كوفي^Iced Coffee^ice^65^images/menu/آيس كوفي.webp|p35^آيس موكا^Iced Mocha^ice^75^images/menu/آيس موكا.webp|p36^آيس لاتيه^Iced Latte^ice^65^images/menu/آيس لاتيه.webp|p37^آيس موكا وايت^Iced White Mocha^ice^70^images/menu/آيس موكا وايت.png|p39^آيس لاتيه فليفر^Iced Flavored Latte^ice^70^images/menu/آيس لاتيه فليفر.png|p40^آيس ماتشا^Iced Matcha^matcha^70^images/menu/آيس ماتشا.webp|p41^ماتشا فرابيه^Matcha Frappe^matcha^80^images/menu/ماتشا فرابيه.webp|p42^شوكلت^Chocolate Frappe^frappe^60^images/menu/فرابيه شوكلت.webp|p43^كارميل^Caramel Frappe^frappe^65^images/menu/فرابيه كارميل.webp|p44^فانيليا^Vanilla Frappe^frappe^65^images/menu/فرابيه فانيليا.webp|p45^بندق^Hazelnut Frappe^frappe^65^images/menu/فرابيه بندق.webp|p46^بيستاشيو^Pistachio Frappe^frappe^70^images/menu/فرابيه بيستاشيو.webp|p47^نوتيلا^Nutella Frappe^frappe^65^images/menu/فرابيه نوتيلا.webp|p48^تفاح اخضر^Green Apple Smoothie^smoothie^50^images/menu/اسموزي تفاح اخضر.png|p49^خوخ^Peach Smoothie^smoothie^50^images/menu/اسموزي خوخ.png|p50^اناناس^Pineapple Smoothie^smoothie^50^images/menu/اسموزي اناناس.png|p51^باشن فروت^Passion Fruit Smoothie^smoothie^50^images/menu/اسموزي باشن فروت.webp|p52^مانجو^Mango Smoothie^smoothie^55^images/menu/اسموزي مانجو.webp|p53^بطيخ^Watermelon Smoothie^smoothie^55^images/menu/بطيخ.webp|p54^فراولة^Strawberry Smoothie^smoothie^55^images/menu/فراولة.webp|p55^ميكس بيري^Mixed Berry Smoothie^smoothie^55^images/menu/اسموزي ميكس بيري.webp|p56^كيوي^Kiwi Smoothie^smoothie^60^images/menu/كيوي.webp|p57^شوكلت^Chocolate Milkshake^milkshake^60^images/menu/ميلك شيك شوكلت.webp|p58^كراميل^Caramel Milkshake^milkshake^60^images/menu/ميلك شيك كراميل.webp|p59^فانيليا^Vanilla Milkshake^milkshake^60^images/menu/ميلك شيك فانيليا.webp|p60^فراولة^Strawberry Milkshake^milkshake^65^images/menu/فراولة.webp|p61^خوخ^Peach Milkshake^milkshake^60^images/menu/ميلك شيك خوخ.webp|p62^مانجا^Mango Milkshake^milkshake^65^images/menu/مانجا.webp|p63^بندق^Hazelnut Milkshake^milkshake^65^images/menu/ميلك شيك بندق.png|p64^بلو بيري^Blueberry Milkshake^milkshake^60^images/menu/ميلك شيك بلو بيري.png|p65^مكس بيري^Mixed Berry Milkshake^milkshake^60^images/menu/ميلك شيك مكس بيري.webp|p66^نوتيلا^Nutella Milkshake^milkshake^65^images/menu/ميلك شيك نوتيلا.webp|p67^وايت نوتيلا براوني^White Nutella Brownie Milkshake^milkshake^70^images/menu/ميلك شيك وايت نوتيلا براوني.png|p68^باشون فروت^Passion Fruit Milkshake^milkshake^65^images/menu/ميلك شيك باشون فروت.png|p69^كلاسيك^Classic Yogurt^yogurt^60^images/menu/زبادي كلاسيك.png|p70^مانجو^Mango Yogurt^yogurt^70^images/menu/زبادي مانجو.webp|p71^فراوله^Strawberry Yogurt^yogurt^70^images/menu/زبادي فراوله.png|p72^خوخ^Peach Yogurt^yogurt^70^images/menu/زبادي خوخ.webp|p73^موز^Banana Yogurt^yogurt^70^images/menu/موز.webp|p74^بلو بيري^Blueberry Yogurt^yogurt^70^images/menu/زبادي بلو بيري.webp|p75^باشن فروت^Passion Fruit Yogurt^yogurt^70^images/menu/زبادي باشن فروت.webp|p76^عسل^Honey Yogurt^yogurt^65^images/menu/زبادي عسل.png|p77^مكس فواكه^Mixed Fruit Yogurt^yogurt^80^images/menu/زبادي مكس فواكه.png|p78^ليمون^Lemon Juice^juice^50^images/menu/ليمون.webp|p79^ليمون نعناع^Mint Lemon Juice^juice^55^images/menu/ليمون نعناع.webp|p80^برتقال^Orange Juice^juice^60^images/menu/برتقال.webp|p81^فراولة^Strawberry Juice^juice^60^images/menu/فراولة.webp|p82^مانجا^Mango Juice^juice^70^images/menu/مانجا.webp|p83^جوافه^Guava Juice^juice^70^images/menu/جوافه.webp|p84^موز^Banana Juice^juice^70^images/menu/موز.webp|p85^بطيخ^Watermelon Juice^juice^60^images/menu/بطيخ.webp|p86^بلح^Dates Juice^juice^75^images/menu/بلح.png|p87^افوكادو^Avocado Juice^juice^80^images/menu/افوكادو.webp|p88^ديلايت بانش^Delight Punch^cocktail^65^images/menu/ديلايت بانش.png|p89^تيمارا^Timara^cocktail^65^images/menu/تيمارا.png|p90^فلوريدا^Florida^cocktail^65^images/menu/فلوريدا.webp|p91^دابومبا^Dabumba^cocktail^70^images/menu/دابومبا.png|p92^وايت اوشن^White Ocean^cocktail^70^images/menu/وايت اوشن.webp|p93^شهر زاد^Shahrzad^cocktail^70^images/menu/شهر زاد.png|p94^لاروز^La Rose^cocktail^75^images/menu/لاروز.png|p95^صن رايز^Sunrise Mojito^mojito^50^images/menu/موهيتو صن رايز.webp|p96^صن شاين^Sunshine Mojito^mojito^50^images/menu/موهيتو صن شاين.webp|p97^باشون فروت^Passion Fruit Mojito^mojito^50^images/menu/موهيتو باشون فروت.png|p98^توت^Berry Mojito^mojito^50^images/menu/موهيتو توت.png|p99^شيري كولا^Cherry Cola Mojito^mojito^50^images/menu/موهيتو شيري كولا.png|p100^موهيتو شعير^Barley Mojito^mojito^55^images/menu/موهيتو شعير.png|p101^باور صودا^Power Soda Mojito^mojito^75^images/menu/باور صودا.png|p102^بيبسي^Pepsi^cans^30^images/menu/بيبسي.webp|p103^بيبسي دايت^Diet Pepsi^cans^30^images/menu/بيبسي دايت.webp|p104^اسبرايت^Sprite^cans^30^images/menu/اسبرايت.webp|p105^ميرندا^Miranda^cans^30^images/menu/ميرندا.webp|p106^فانتا^Fanta^cans^30^images/menu/فانتا.webp|p107^سفن اب^7UP^cans^30^images/menu/سفن اب.webp|p108^ماونتن ديو^Mountain Dew^cans^30^images/menu/ماونتن ديو.webp|p109^تويست^Twist^cans^30^images/menu/تويست.webp|p110^شويبس^Schweppes^cans^30^images/menu/شويبس.webp|p111^فيروز^Fayrouz^cans^35^images/menu/فيروز.webp|p112^في كولا^V Cola^cans^35^images/menu/في كولا.webp|p113^فيوري^Fuego^cans^30^images/menu/فيوري.webp|p114^بيريل^Birell^cans^35^images/menu/بيريل.webp|p115^ريد بول^Red Bull^cans^75^images/menu/ريد بول.webp|p116^مونستر^Monster^cans^75^images/menu/مونستر.webp|p117^وافل دارك^Dark Waffle^desserts^65^images/menu/وافل دارك.png|p118^وافل نوتيلا^Nutella Waffle^desserts^70^images/menu/وافل نوتيلا.png|p119^وافل وايت^White Waffle^desserts^70^images/menu/وافل وايت.png|p120^وافل لوتس^Lotus Waffle^desserts^70^images/menu/وافل لوتس.png|p121^وافل اوريو^Oreo Waffle^desserts^75^images/menu/وافل اوريو.png|p122^وافل ايس كريم & موز^Ice Cream & Banana Waffle^desserts^80^images/menu/وافل ايس كريم & موز.png|p123^مولتن كيك^Molten Cake^desserts^65^images/menu/مولتن كيك.png|p124^مولتن ايس كريم^Molten Ice Cream^desserts^70^images/menu/مولتن ايس كريم.png|p125^سينابون^Cinnabon^desserts^55^images/menu/سينابون.png|p126^سينابون نوتيلا^Nutella Cinnabon^desserts^60^images/menu/سينابون نوتيلا.png|p127^براونيز^Brownies^desserts^50^images/menu/براونيز.png|p128^فروت سالط^Fruit Salad^desserts^60^images/menu/فروت سالط.png|p129^ايس كريم^Ice Cream^desserts^70^images/menu/فروت سالط ايس كريم.png|p130^ايس كريم مكسرات^Ice Cream with Nuts^desserts^75^images/menu/فروت سالط ايس كريم مكسرات.png';
      const descMap = {
        p88: 'برتقال - جوافة - ليمون - عسل',
        p89: 'كيوي - مانجا',
        p90: 'مانجو - جوافة - فراولة',
        p91: 'فراولة - كيوي - موز - برتقال',
        p92: 'موز - ايس كريم - مكسرات - كريمة',
        p93: 'اناناس - برتقال - خوخ',
        p94: 'مانجو - جوافة - فراولة',
        p95: 'صودا - برتقال',
        p96: 'صودا - برتقال - رمان سيرم',
        p97: 'باشون - بلوشيرم',
        p98: 'صودا - بلوبيري',
        p99: 'صودا - تفاح اخضر - كولا سيرم',
        p100: 'بريل - ليمون - نعناع',
        p101: 'اسبيرسو - رد بول',
      };
      const prods = raw.split('|').map(s => {
        const [id, name, nameEn, category, price, image] = s.split('^');
        return { id, name, nameEn, category, price: Number(price), image: image || '', description: descMap[id] || '', available: 1 };
      });
      for (const p of prods) {
        await this.products.add(p);
      }
    }
    await this.migrateProductDescriptions();
    await this.settings.save({ _seeded: true });
  }
};
