/**
	* MYSQL landproduct 所有商品表
	*/

const LandProductName = 'landproduct'

/*
	@type:
		- 'littleEth' : '0.00001 ETH'
		- 'baseEth': '0.000015 ETH'
		- 'normalEth': '0.000025 ETH'
		- 'moreEth': '0.0001ETH'
		- 'largeETH': '0.0002 ETH'
		- 'bamboo': '5'
*/

let LandProductClientModel = {
	longitude: 'longitude',
	latitude: 'latitude',
	type: 'type',
	value: 'value'
}
let LandProductServerModel = {
	id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
	productId: {
		label: 'uk_productId',
		type: 'VARCHAR(20)'
	},
	type: {
		label: 'idx_type',
		type: 'varchar(5)'
	},
	productType: {
		label: 'idx_productType',
		type: 'varchar(15)'
	},
	state: {
		label: 'state',
		type: 'varchar(10)'
	},
	time: {
		label: 'time',
		type: 'bigint unsigned'
	},
	leftCount: {
		label: 'leftCount',
		type: 'smallint unsigned'
	},
	period: {
  	label: 'idx_period',
  	type: 'smallint unsigned'
  },
	imgSrc: {
		label: 'imgSrc',
		type: 'varchar(70)'
	},
	name: {
		label: 'name',
		type: 'varchar(150)'
	},
	nameEn: {
		label: 'nameEn',
		type: 'varchar(200)'
	},
	value: {
		label: 'value',
		type: 'decimal(6, 2)'
	},
	productSrc: {
		label: 'productSrc',
		type: 'varchar(350)'
	},
	recommender: {
		label: 'recommender',
		type: 'varchar(20)'
	},
	gmt_create: {
    label: 'gmt_create',
    type: 'datetime'
  },
  gmt_modified: {
    label: 'gmt_modified',
    type: 'datetime'
  },
	// 索引
  pk_id: {
    label: 'primary key(pk_id),'
  },
  uk_productId: {
  	label: 'unique key(uk_productId),'
  },
  idx_type: {
  	label: 'index (idx_type),'
  },
  idx_productType: {
  	label: 'index (idx_productType),'
  },
  idx_period: {
  	label: 'index (idx_period)'
  },
	other: {
		label: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}
/**
	@数据插入
	insert into landproduct values('fangshang','fire','sold',0,'https://image.ibb.co/eKJjR7/5ae9326c_Nad9fb674.jpg','艾以纯衣长袖t恤男士纯色印花修身纯棉圆领休闲短袖T恤男半袖体恤衫2018夏季新',100,'ETHLAND');
	insert into landproduct values('three_giss','fire','sold',0,'https://image.ibb.co/gPjPR7/5a3a3de7_Nf6b6fe58.jpg','三只松鼠 坚果零食礼盒 夏威夷果碧根果巴旦木核桃 坚果大礼包火红A 1493g',100,'ETHLAND');
	insert into landproduct values('gucci','fire','sold',0,'https://image.ibb.co/c2OvYn/584779e6_N63ee31dd.jpg','GUCCI 古驰 女士粉色牛皮斜挎包 466506 CAO0G 5806',5400,'ETHLAND');
	insert into landproduct values('mac','earth','sold',0,'https://image.ibb.co/cRwJKS/5a694955_N21107862_1.jpg','Apple MacBook Pro 13.3英寸笔记本电脑',15000,'ETHLAND');
	insert into landproduct values('luotuo','fire','sold',0,'https://image.ibb.co/iyvvzS/5871e100_N639cb0bf.jpg','骆驼户外双肩背包 26L男女通用徒步旅行出游迷彩包 绿迷彩 均码',400,'ETHLAND');
*/

const LandProductInserData = [
	{
		productId: 'champion_sold',
		type: 'fire',
		productType: 'clothing',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/81x3RtQemGL._UL1500_.jpg',
		name: 'Champion 男士 Classic Jersey 印花 T恤',
		nameEn: 'Champion Men Classic Jersey Print T-Shirt',
		value: 83,
		productSrc: 'https://www.amazon.cn/dp/B072Y68647/ref=sr_1_1?ie=UTF8&qid=1528558577&sr=8-1&keywords=%E4%BC%98%E8%A1%A3%E5%BA%93&th=1'
	},
	{
		productId: 'volong_sold',
		type: 'water',
		productType: 'food',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/61FL6wMyYTL._SL800_.jpg',
		name: '沃隆 每日坚果A款750g（25g*30包）混合坚果仁大礼包',
		nameEn: 'Daily Nuts 750g (25g*30 pack)',
		value: 146,
		productSrc: 'https://www.amazon.cn/dp/B01GY311UY/ref=sr_1_1?ie=UTF8&qid=1528558103&sr=8-1&keywords=%E4%B8%89%E5%8F%AA%E6%9D%BE%E9%BC%A0&th=1'
	},
	{
		productId: 'gucci_sold',
		type: 'earth',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/61LOzF2yHAL._UL1500_.jpg',
		name: 'Gucci 手表 Guccissima 棕色表盘 YA134506 Ya 女士',
		nameEn: 'Gucci watch Guccissima brown dial YA134506 Ya',
		value: 2521,
		productSrc: 'https://www.amazon.cn/dp/B00R5Z8PIW/ref=sr_1_1?ie=UTF8&qid=1528559539&sr=8-1&keywords=GUCCI+%E5%8F%A4%E9%A9%B0+%E5%A5%B3%E5%A3%AB'
	},
	{
		productId: 'ipad_sold',
		type: 'fire',
		productType: 'digital',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/61DhMQj22ZL._SL1000_.jpg',
		name: 'Apple iPad mini 4 MK9Q2CH/A 7.9英寸平板电脑 (128G/WLAN/金色)',
		nameEn: 'Apple iPad mini 4 MK9Q2CH/A 7.9-inch Tablet (128G/WLAN/Gold)',
		value: 2621,
		productSrc: 'https://www.amazon.cn/dp/B015FGE9AU/ref=sr_1_1?ie=UTF8&qid=1528558953&sr=8-1&keywords=ipad%2Bmini&th=1'
	},
	{
		productId: 'camel_sold',
		type: 'water',
		productType: 'clothing',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/61eQzOKCkRL._SL1000_.jpg',
		name: 'Camel 骆驼 户外男女款骑行背包 13L运动双肩背包A6S3C3116',
		nameEn: 'camel outdoor men and women riding backpack 13L sports backpack A6S3C3116',
		value: 158,
		productSrc: 'https://www.amazon.cn/dp/B01DNNN8Q8/ref=sr_1_2?ie=UTF8&qid=1528559060&sr=8-2&keywords=%E9%AA%86%E9%A9%BC%E6%88%B7%E5%A4%96%E5%8F%8C%E8%82%A9%E8%83%8C%E5%8C%85&th=1&psc=1'
	},
	{
		productId: 'nautica_prep',
		type: 'fire',
		productType: 'clothing ',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/nautica.jpg',
		name: 'Nautica 诺帝卡 男式 条纹 Polo 衫',
		nameEn: 'Nautica Nordisk Mens Striped Polo Shirt',
		value:258,
		productSrc: 'https://www.amazon.cn/dp/B00JOS97C6/ref=sr_1_18?m=A2EDK7H33M5FFG&s=amazon-global-store&ie=UTF8&qid=1529852305&sr=1-18'
	},
	{
		productId: 'ferrero_prep',
		type: 'water',
		productType: 'food',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/ferrero.jpg',
		name: 'Ferrero 费列罗 Rocher榛果威化巧克力T3*16 48粒装600g',
		nameEn: 'Ferrero Rocher Hazelnut Chocolate T3*16 48 Capsules 600g',
		value: 149,
		productSrc: 'https://www.amazon.cn/dp/B01HPW4PSI/ref=lp_2134663051_1_7?s=grocery&ie=UTF8&qid=1529852470&sr=1-7'
	},
	{
		productId: 'gucci_prep',
		type: 'earth',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/gucci.jpg',
		name: '女神就是要刚柔并济Gucci 古驰 青竹香水喷雾 50ml',
		nameEn: 'The goddess is to be soft and gentle Gucci Gucci Green Bamboo Eau De Parfum Spray 50ml',
		value: 486,
		productSrc: 'https://www.amazon.cn/dp/B06XF6HH4L/ref=sr_1_1?s=amazon-global-store&ie=UTF8&qid=1529852593&sr=8-1&keywords=%E5%8F%A4%E9%A9%B0%E9%A6%99%E6%B0%B4'
	},
	{
		productId: 'kindle_prep',
		type: 'fire',
		productType: 'digital',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/kindle.jpg',
		name: 'Kindle Paperwhite电子书阅读器',
		nameEn: 'Kindle Paperwhite E-book reader',
		value: 958,
		productSrc: 'https://www.amazon.cn/dp/B00QJDOLIO/ref=sr_1_1?s=amazon-devices&ie=UTF8&qid=1529851901&sr=1-1&keywords=kindle%E9%98%85%E8%AF%BB%E5%99%A8'
	},
	{
		productId: 'august_prep',
		type: 'water',
		productType: 'digital',
		state: 'voting',
		period: 1,
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/watch.jpg',
		name: '英国品牌 August 奥科斯 SWB200 智能手环 心率/血氧/疲劳度监测 运动计步睡眠监控 IP67防水',
		nameEn: 'British brand August OXOS SWB200 smart bracelet Heart rate/oxygen/fatigue monitoring Sports step counter sleep monitoring IP67 waterproof',
		value: 309,
		productSrc: 'https://www.amazon.cn/dp/B077SSL2H2/ref=lp_1813550071_1_2?srs=1813550071&ie=UTF8&qid=1529852681&sr=8-2'
	},
	{
		productId: 'foreo_prep',
		type: 'fire',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'FOREO 斐珞尔 露娜LUNA play plus玩趣增強版洁面仪洗脸刷(粉红色) 可更换电池',
		nameEn: 'FOREO LUNA plus play enhanced version of the cleansing instrument wash brush (pink) replaceable battery',
		value: 379,
		productSrc: 'https://www.amazon.cn/dp/B078HTVRVG/ref=sr_1_4?ie=UTF8&qid=1532790584&sr=8-4&keywords=foreo%2Bluna&th=1.'
	},
	{
		productId: 'too_faced_period_1',
		type: 'fire',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Too faced 花生酱 and Honey 眼影盘系列11.1 gram',
		nameEn: 'Too faced Peanut Butter and Honey Eyeshadow Palette 11.1 gram',
		value: 698,
		productSrc: 'https://www.amazon.cn/dp/B06WP88TT3/ref=sr_1_fkmr0_3?ie=UTF8&qid=1532790947&sr=8-3-fkmr0&keywords=too+faced%E8%9C%9C%E6%A1%83%E7%9B%98Too.'
	},
	{
		productId: 'omron_period_1',
		type: 'fire',
		productType: 'digital',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'OMRON 欧姆龙 低频低周波脉冲便携按摩仪HV-F022 浅紫色',
		nameEn: 'OMRON low frequency low frequency pulse portable massager HV-F022 light purple',
		value: 458,
		productSrc: 'https://www.amazon.cn/dp/B07D3WVTZD/ref=sr_1_1?ie=UTF8&qid=1532791023&sr=8-1&keywords=%E6%AC%A7%E5%A7%86%E9%BE%99%E6%8C%89%E6%91%A9%E5%99%A8&th=1OMRON.'
	},
	{
		productId: 'ysl_period_1',
		type: 'fire',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Yves Saint Laurent 圣罗兰 Yves Saint Laurent 奢华锻面镜光唇釉 - # 12 Corail Fauve 6ml/0.2oz',
		nameEn: 'Yves Saint Laurent Luxury Forged Mirror Lip Gloss - # 12 Corail Fauve 6ml/0.2oz',
		value: 295,
		productSrc: 'https://www.amazon.cn/dp/B06XWFJSVD/ref=sr_1_1?ie=UTF8&qid=1532791293&sr=8-1&keywords=ysl%E5%94%87%E9%87%8912&th=1.'
	},
	{
		productId: 'oribe_period_1',
		type: 'fire',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'ORIBE Gold Lust黄金滋养发油，3.4液体盎司（100ml）',
		nameEn: 'ORIBE Gold Lust Nourishing Hair Oil, 3.4 fl oz (100 ml)',
		value: 375,
		productSrc: 'https://www.amazon.cn/dp/B00BH3INN0/ref=pd_sim_194_2?_encoding=UTF8&pd_rd_i=B00BH3INN0&pd_rd_r=13447929-927a-11e8-af08-bf02adc80a3b&pd_rd_w=b7qiW&pd_rd_wg=UArU8&pf_rd_i=desktop-dp-sims&pf_rd_m=A1AJ19PSB66TGU&pf_rd_p=3227400875450121135&pf_rd_r=6SJ1899PPKB9N4RREC6Z&pf_rd_s=desktop-dp-sims&pf_rd_t=40701&psc=1&refRID=6SJ1899PPKB9N4RREC6ZORIBE.'
	},
	{
		productId: 'lancome_period_1',
		type: 'fire',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Lancome 兰蔻 阳光古铜顺滑防护霜(防晒BB霜)SPF50 50ml/1.69oz',
		nameEn: 'Lancome Sunshine Bronze Smoothing Protective Cream (Sunscreen BB Cream) SPF50 50ml/1.69oz',
		value: 295,
		productSrc: 'https://www.amazon.cn/dp/B075LZMBTQ/ref=sr_1_2?ie=UTF8&qid=1532791801&sr=8-2&keywords=%E5%85%B0%E8%94%BB%E9%98%B2%E6%99%92Lancome'
	},
	{
		productId: 'lancome_period_1',
		type: 'fire',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Natura Bissé悦碧施均衡洁肤清洁面膜 75ml',
		nameEn: 'Natura Bissé Balance Cleansing Mask 75ml',
		value: 233,
		productSrc: 'https://www.amazon.cn/dp/B008442LEM/ref=sr_1_1?ie=UTF8&qid=1532791848&sr=8-1&keywords=nature+bisseNatura'
	},
	{
		productId: 'natura_period_1',
		type: 'fire',
		productType: 'cosmetic',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Natura Bissé悦碧施均衡洁肤清洁面膜 75ml',
		nameEn: 'Natura Bissé Balance Cleansing Mask 75ml',
		value: 233,
		productSrc: 'https://www.amazon.cn/dp/B008442LEM/ref=sr_1_1?ie=UTF8&qid=1532791848&sr=8-1&keywords=nature+bisseNatura'
	},
	{
		productId: 'vaxpot_clothing_1',
		type: 'fire',
		productType: 'clothing',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'vaxpot （点）防晒衣连帽卫衣长袖女款【已抗紫外线 UPF50 + 】 VA 4012',
		nameEn: 'Vaxpot sun protection clothing hooded sweater long-sleeved womens [UV-resistant UPF50 + 】 VA 4012',
		value: 142,
		productSrc: 'https://www.amazon.cn/dp/B003SLQBFQ/ref=sr_1_1?ie=UTF8&qid=1532792103&sr=8-1&keywords=%E4%BC%98%E8%A1%A3%E5%BA%93%E9%98%B2%E6%99%92&th=1'
	},
	{
		productId: 'nike_clothing_1',
		type: 'fire',
		productType: 'clothing',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Nike 双肩包男 2018新款学生书包运动休闲背包BA5230-010',
		nameEn: 'Nike backpack male 2018 new student bag sports and leisure backpack BA5230-010',
		value: 319,
		productSrc: 'https://www.amazon.cn/dp/B079GT1C7G/ref=sr_1_2?ie=UTF8&qid=1532792183&sr=8-2&keywords=%E8%80%90%E5%85%8B%E5%8F%8C%E8%82%A9%E5%8C%85&th=1&psc=1'
	},
	{
		productId: 'ck_clothing_1',
		type: 'fire',
		productType: 'clothing',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Calvin Klein 男士 SHIRT',
		nameEn: 'Calvin Klein man SHIRT',
		value: 163,
		productSrc: 'https://www.amazon.cn/dp/B0119GAMB0/ref=sr_1_10?ie=UTF8&qid=1532792256&sr=8-10&keywords=%E7%94%B7%E5%A3%ABt%E6%81%A4ckCalvin&th=1'
	},
	{
		productId: 'topwise_digital_1',
		type: 'fire',
		productType: 'digital',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Topwise i7蓝牙耳机 重低音 充电宝 (黑色)',
		nameEn: 'Topwise i7 Bluetooth Headset Subwoofer Charging Po (Black)',
		value: 299,
		productSrc: 'https://www.amazon.cn/dp/B074FZ2R4P/ref=lp_665018051_1_2_sspa?s=wireless&ie=UTF8&qid=1532792930&sr=1-2-spons&th=1'
	},
	{
		productId: 'champion_clothing_1',
		type: 'fire',
		productType: 'clothing',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Champion 男士运动长裤',
		nameEn: 'Champion Men Sports Trousers',
		value: 102,
		productSrc: 'https://www.amazon.cn/dp/B00FSB64NI/ref=lp_1536479071_1_8?s=apparel&ie=UTF8&qid=1532792527&sr=1-8Champion&th=1'
	},
	{
		productId: 'dickies_clothing_1',
		type: 'fire',
		productType: 'clothing',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: '[ Dickies ] ミニトートバッグ Corduroy Mini Tote コーデュロイミニトート 14472900',
		nameEn: '[Dickies] Mini Tote Bag Corduroy Mini Tote Corduroy Mini Tote 14472900',
		value: 210,
		productSrc: 'https://www.amazon.cn/dp/B075V1BRR5/ref=sr_1_31?s=luggage&ie=UTF8&qid=1532792723&sr=1-31&keywords=dickies&th=1'
	},
	{
		productId: 'lining_digital_1',
		type: 'fire',
		productType: 'digital',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'LINING李宁 全碳素羽毛球拍男女单拍HC系列',
		nameEn: 'LINING full carbon badminton racket men and women single shot HC series',
		value: 252,
		productSrc: 'https://www.amazon.cn/dp/B07DQF1V6R/ref=lp_836330051_1_4_sspa?s=sporting-goods&ie=UTF8&qid=1532793139&sr=1-4-spons&th=1'
	},
	{
		productId: 'petkit_other_1',
		type: 'fire',
		productType: 'other',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Petkit  四季深睡床垫狗狗睡觉',
		nameEn: 'Petkit Four Seasons Deep Sleeping Mattress Dog Sleeping',
		value: 199,
		productSrc: 'https://www.amazon.cn/dp/B07DPGZDY8/ref=lp_1760065071_1_5?s=pet-supplies&ie=UTF8&qid=1532793331&sr=1-5Petkit'
	},
	{
		productId: 'whirldy_digital_1',
		type: 'fire',
		productType: 'digital',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Whirldy 手机镜头 三合一镜头 广角 + 微距 + 长焦 12X 望远镜 外置镜头 滤镜 套装 苹果 华为 三星 小米 OPPO VIVO 通用',
		nameEn: 'Whirldy mobile phone lens three-in-one lens wide angle + macro + telephoto 12X telescope external lens filter set Apple Huawei Samsung millet OPPO VIVO universal',
		value: 156,
		productSrc: 'https://www.amazon.cn/dp/B077NYX23K/ref=lp_49404071_1_1_sspa?s=sporting-goods&ie=UTF8&qid=1532793377&sr=1-1-spons&th=1Whirldy'
	},
	{
		productId: 'happybabby_food_1',
		type: 'fire',
		productType: 'food',
		state: 'voting',
		period: 1,
		imgSrc: '',
		name: 'Happy Baby 有机Superfood小点心 ，芝士&谷物&西兰花&切达干酪1.63盎司（46g），6罐装，Non-GMO，不含BPA包装',
		nameEn: 'Happy Baby Organic Superfood Snack, 1.63 oz (46 g), 6 cans, Non-GMO, BPA free',
		value: 157,
		productSrc: 'https://www.amazon.cn/dp/B004ET9OLY/ref=sr_1_19?ie=UTF8&qid=1532793425&sr=8-19&keywords=%E9%9B%B6%E9%A3%9FHappy'
	},
	// 虚拟货币部分
	// {
	// 	productId: 'eth',
	// 	type: 'fire',
	// 	productType: 'currency',
	// 	state: 'sold',
	// 	period: 1,
	// 	imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/ethereum.png',
	// 	name: 'Ethereum',
	// 	nameEn: 'Ethereum',
	// 	value: '3000.46',
	// 	productSrc: ''
	// },
	// {
	// 	productId: 'eos',
	// 	type: 'water',
	// 	productType: 'currency',
	// 	state: 'sold',
	// 	period: 1,
	// 	imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/eos.png',
	// 	name: 'EOS',
	// 	nameEn: 'EOS',
	// 	value: '80.24',
	// 	productSrc: ''
	// },
	// {
	// 	productId: 'xrp',
	// 	type: 'fire',
	// 	productType: 'currency',
	// 	state: 'sold',
	// 	period: 1,
	// 	imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/ripple.png',
	// 	name: 'Ripple',
	// 	nameEn: 'Ripple',
	// 	value: '3.44',
	// 	productSrc: ''
	// },
	// {
	// 	productId: 'ltc',
	// 	type: 'fire',
	// 	productType: 'currency',
	// 	state: 'sold',
	// 	period: 1,
	// 	imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/litecoin.png',
	// 	name: 'Litecoin',
	// 	nameEn: 'Litecoin',
	// 	value: '614.48',
	// 	productSrc: ''
	// },
	// {
	// 	productId: 'iota',
	// 	type: 'fire',
	// 	productType: 'currency',
	// 	state: 'sold',
	// 	period: 1,
	// 	imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/iota.png',
	// 	name: 'Iota',
	// 	nameEn: 'Iota',
	// 	value: '7.73',
	// 	productSrc: ''
	// },
	// {
	// 	productId: 'cardano',
	// 	type: 'fire',
	// 	productType: 'currency',
	// 	state: 'sold',
	// 	period: 1,
	// 	imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/cardano.png',
	// 	name: 'Cardano',
	// 	nameEn: 'Cardano',
	// 	value: '0.99',
	// 	productSrc: ''
	// },
	// {
	// 	productId: 'menero',
	// 	type: 'fire',
	// 	productType: 'currency',
	// 	state: 'sold',
	// 	period: 1,
	// 	imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/monero.png',
	// 	name: 'Menero',
	// 	nameEn: 'Menero',
	// 	value: '772.34',
	// 	productSrc: ''
	// }
]

module.exports = {
	LandProductServerModel: LandProductServerModel,
	LandProductClientModel:LandProductClientModel,
	LandProductName: LandProductName,
	LandProductInserData: LandProductInserData
}