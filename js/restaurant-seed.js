/* Approved restaurant menu. Import runs once atomically from product management. */
(function (root) {
  var categories = [
    ['pizza', 'بيتزا'], ['offers', 'عروض خاصة'], ['chicken-crepes', 'كريبات دجاج'],
    ['cheese-crepes', 'كريبات جبنة'], ['meat-crepes', 'كريبات لحوم'], ['sweet-crepes', 'كريبات حلو'],
    ['sandwiches', 'سندوتشات'], ['combo', 'كومبو']
  ];
  // category, stable id, Arabic, English, Medium, Large, Small
  var rows = [
    ['pizza','vegetable','بيتزا خضروات','Vegetable Pizza',125,165],
    ['pizza','pepperoni','بيتزا ببيروني','Pepperoni Pizza',150,190],
    ['pizza','fajita','بيتزا فاهيتا دجاج','Chicken Fajita Pizza',130,200],
    ['pizza','liver-cheese','بيتزا ليفر تشيز','Liver Cheese Pizza',140,200],
    ['pizza','margherita','بيتزا مارجريتا','Margherita Pizza',100,150],
    ['pizza','turkey','بيتزا تركي مدخن دجاج','Smoked Turkey & Chicken Pizza',145,200],
    ['pizza','sujuk','بيتزا سجق','Sujuk Pizza',140,185],
    ['pizza','strips','بيتزا استريبس دجاج','Chicken Strips Pizza',140,185],
    ['pizza','meat','بيتزا لحم','Meat Pizza',160,200],
    ['pizza','tawook','بيتزا شيش طاووق','Chicken Shish Tawook Pizza',155,200],
    ['offers','family','بيتزا فاميلي — اختار مكوناتك','Family Pizza',null,400],
    ['offers','kids','بيتزا أطفال مع عصير هدية','Kids Pizza with Juice',null,null,150],
    ['chicken-crepes','strips','كريب استربس','Chicken Strips Crepe',180],
    ['chicken-crepes','panee','كريب بانيه','Chicken Panée Crepe',160],
    ['chicken-crepes','cordon','كريب كوردن بلو','Cordon Bleu Crepe',200],
    ['chicken-crepes','crunchy','كريب سوبر كرانشي','Super Crunchy Crepe',190],
    ['chicken-crepes','tawook','كريب شيش طاووق','Shish Tawook Crepe',180],
    ['chicken-crepes','fajita','كريب فاهيتا دجاج','Chicken Fajita Crepe',180],
    ['chicken-crepes','mixed','كريب ميكس دجاج','Mixed Chicken Crepe',200],
    ['chicken-crepes','zinger','كريب زنجر','Zinger Crepe',170],
    ['cheese-crepes','mozzarella','كريب موتزاريلا','Mozzarella Crepe',100],
    ['cheese-crepes','mixed','كريب ميكس جبن','Mixed Cheese Crepe',145],
    ['cheese-crepes','romy','كريب جبنة رومي','Romy Cheese Crepe',100],
    ['meat-crepes','baladi','كريب لحمة بلدي','Baladi Meat Crepe',200],
    ['meat-crepes','kofta','كريب كفتة','Kofta Crepe',190],
    ['meat-crepes','sausage','كريب سوسيس','Sausage Crepe',150],
    ['meat-crepes','burger','كريب برجر','Burger Crepe',160],
    ['meat-crepes','mixed','كريب ميكس لحوم','Mixed Meat Crepe',200],
    ['sweet-crepes','chocolate','كريب شوكولاتة - لوتس وفواكه','Chocolate or Lotus & Fruits Crepe',120],
    ['sandwiches','chicken-liver','ساندوتش كبدة دجاج','Chicken Liver Sandwich',100,120],
    ['sandwiches','fajita','ساندوتش فاهيتا دجاج','Chicken Fajita Sandwich',100,120],
    ['sandwiches','lamb-liver','ساندوتش كبدة غنم','Lamb Liver Sandwich',120,130],
    ['sandwiches','meat-potato','ساندوتش لحم بالبطاطس','Meat & Potato Sandwich',120,150],
    ['sandwiches','philly','ساندوتش فيلي لحم','Beef Philly Sandwich',140,160],
    ['sandwiches','francisco','ساندوتش فرانسيسكو دجاج','Chicken Francisco Sandwich',120,155],
    ['sandwiches','twister','ساندوتش تويستر دجاج','Chicken Twister Sandwich',120,160],
    ['sandwiches','hotdog','ساندوتش هوت دوج','Hot Dog Sandwich',120,140],
    ['combo','chicken-liver','كومبو كبدة دجاج','Chicken Liver Combo',150],
    ['combo','fajita','كومبو فاهيتا','Fajita Combo',180],
    ['combo','liver','كومبو كبدة لحم','Liver Combo',190],
    ['combo','meat-potato','كومبو لحم بالبطاطس','Meat & Potato Combo',200],
    ['combo','philly','كومبو فيلي','Philly Combo',210],
    ['combo','francisco','كومبو فرانسيسكو','Francisco Combo',215],
    ['combo','twister','كومبو تويستر','Twister Combo',220]
  ];
  function products() {
    return rows.map(function (r) {
      var prices = { small: r[6], medium: r[4], large: r[5] };
      var vs = Catalog.sizes.map(function (k) { return { key: k, label: Catalog.labels[k], price: prices[k] == null ? null : prices[k], available: prices[k] != null }; });
      var first = vs.filter(function (v) { return v.available; })[0];
      return { id: 'restaurant-' + r[0] + '-' + r[1], name: r[2], nameEn: r[3], menuType: 'restaurant', category: 'restaurant-' + r[0],
        price: first.price, defaultVariantKey: first.key, variants: vs, available: true, image: '', description: r[0] === 'combo' ? 'ساندوتش + بطاطس + بيبسي' : '' };
    });
  }
  async function importMenu() {
    await FB.ensure();
    var db = FB.getDb(), marker = db.collection('settings').doc('_restaurantMenuV1');
    var docs = categories.map(function (c, i) { return { collection: 'categories', data: { id: 'restaurant-' + c[0], slug: 'restaurant-' + c[0], name: c[1], menuType: 'restaurant', order: 100 + i } }; });
    products().forEach(function (p) { docs.push({ collection: 'products', data: p }); });
    var count = await db.runTransaction(async function (tx) {
      if ((await tx.get(marker)).exists) return 0;
      var snaps = await Promise.all(docs.map(function (d) { return tx.get(db.collection(d.collection).doc(d.data.id)); }));
      var added = 0;
      docs.forEach(function (d, i) { if (!snaps[i].exists) { tx.set(db.collection(d.collection).doc(d.data.id), d.data); added++; } });
      tx.set(marker, { id: '_restaurantMenuV1', key: '_restaurantMenuV1', value: true });
      tx.set(db.collection('meta').doc('versions'), { versions: { products: firebase.firestore.FieldValue.increment(1), categories: firebase.firestore.FieldValue.increment(1) } }, { merge: true });
      return added;
    });
    await Promise.all([FB.invalidate('products'), FB.invalidate('categories')]);
    return count;
  }
  root.RestaurantSeed = { products: products, importMenu: importMenu };
}(window));
