# Print Agent - طباعة على طابعتين + فتح الدرج

موقع Laguna Cafe على GitHub Pages (static) مش بيقدر يطبع مباشرة على الطابعات.
الـ Print Agent ده برنامج Node.js صغير شغال على **جهاز الكاشير نفسه**،
والموقع بيبعت له طلب الطباعة، وهو بيطبع على الطابعتين ويفتح الدرج.

## التركيب

1. **Node.js** (لو مش مثبت): `nodejs.org` أو `sudo apt install nodejs npm`

2. غير IP طابعة المطبخ في `config.js`

3. ثبت الحزم:
   ```
   npm install
   ```

4. **مهم - وندوز فقط**: ثبت [Zadig](https://zadig.akeo.ie/)
   - اختار طابعة USB من القايمة
   - ركب driver: **WinUSB** أو **libusbK**
   - (عشان Node يقدر يوصلها عبر USB)

5. شغل:
   ```
   npm start
   ```

## التشغيل التلقائي مع بداية الجهاز

```
npm install -g pm2
pm2 start server.js --name print-agent
pm2 save
pm2 startup
```

## ربطه مع الموقع

في صفحة **الإعدادات** بالموقع:
1. حط رابط الـ Agent (مثلاً `http://192.168.1.100:4321`)
2. فعّل "استخدام Print Agent"

لما تعمل كده، كل فاتورة بتتبعت تلقائياً للـ Agent اللي بيطبعها على الطابعتين ويفتح الدرج.

## اختبار

```
curl http://localhost:4321/health
```

## لو الدرج ما فتحش

جرب تغير `drawerKick.pin` في `config.js`:
- `0` (معظم الطابعات)
- `1` (بعض الموديلات)
- أو `{ pin: 0, onTime: 50, offTime: 50 }`

## troubleshoot

- **مافيش طابعة USB**: تأكد من Zadig driver والكابل
- **مافيش وصول للمطبخ**: اعمل `ping 192.168.1.50` (IP الطابعة)
- **CORS error**: السيرفر فيه `cors()` مفعلة، ده كافي
