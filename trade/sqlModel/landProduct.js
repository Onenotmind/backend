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
		type: 'varchar(10)'
	},
	state: {
		label: 'state',
		type: 'char(4)'
	},
	time: {
		label: 'time',
		type: 'bigint unsigned'
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
  	label: 'index (idx_productType)'
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
		productType: 'product',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/81x3RtQemGL._UL1500_.jpg',
		name: 'Champion 男士 Classic Jersey 印花 T恤',
		nameEn: 'Champion Men Classic Jersey Print T-Shirt',
		value: 83,
		productSrc: 'https://www.amazon.cn/dp/B072Y68647/ref=sr_1_1?ie=UTF8&qid=1528558577&sr=8-1&keywords=%E4%BC%98%E8%A1%A3%E5%BA%93&th=1'
	},
	{
		productId: 'volong_sold',
		type: 'water',
		productType: 'product',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/61FL6wMyYTL._SL800_.jpg',
		name: '沃隆 每日坚果A款750g（25g*30包）混合坚果仁大礼包',
		nameEn: 'Daily Nuts 750g (25g*30 pack)',
		value: 146,
		productSrc: 'https://www.amazon.cn/dp/B01GY311UY/ref=sr_1_1?ie=UTF8&qid=1528558103&sr=8-1&keywords=%E4%B8%89%E5%8F%AA%E6%9D%BE%E9%BC%A0&th=1'
	},
	{
		productId: 'gucci_sold',
		type: 'earth',
		productType: 'product',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/61LOzF2yHAL._UL1500_.jpg',
		name: 'Gucci 手表 Guccissima 棕色表盘 YA134506 Ya 女士',
		nameEn: 'Gucci watch Guccissima brown dial YA134506 Ya',
		value: 2521,
		productSrc: 'https://www.amazon.cn/dp/B00R5Z8PIW/ref=sr_1_1?ie=UTF8&qid=1528559539&sr=8-1&keywords=GUCCI+%E5%8F%A4%E9%A9%B0+%E5%A5%B3%E5%A3%AB'
	},
	{
		productId: 'ipad_sold',
		type: 'fire',
		productType: 'product',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/61DhMQj22ZL._SL1000_.jpg',
		name: 'Apple iPad mini 4 MK9Q2CH/A 7.9英寸平板电脑 (128G/WLAN/金色)',
		nameEn: 'Apple iPad mini 4 MK9Q2CH/A 7.9-inch Tablet (128G/WLAN/Gold)',
		value: 2621,
		productSrc: 'https://www.amazon.cn/dp/B015FGE9AU/ref=sr_1_1?ie=UTF8&qid=1528558953&sr=8-1&keywords=ipad%2Bmini&th=1'
	},
	{
		productId: 'camel_sold',
		type: 'water',
		productType: 'product',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/61eQzOKCkRL._SL1000_.jpg',
		name: 'Camel 骆驼 户外男女款骑行背包 13L运动双肩背包A6S3C3116',
		nameEn: 'camel outdoor men and women riding backpack 13L sports backpack A6S3C3116',
		value: 158,
		productSrc: 'https://www.amazon.cn/dp/B01DNNN8Q8/ref=sr_1_2?ie=UTF8&qid=1528559060&sr=8-2&keywords=%E9%AA%86%E9%A9%BC%E6%88%B7%E5%A4%96%E5%8F%8C%E8%82%A9%E8%83%8C%E5%8C%85&th=1&psc=1'
	},
	{
		productId: 'nautica_prep',
		type: 'fire',
		productType: 'product',
		state: 'prep',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/nautica.jpg',
		name: 'Nautica 诺帝卡 男式 条纹 Polo 衫',
		nameEn: 'Nautica Nordisk Mens Striped Polo Shirt',
		value:258,
		productSrc: 'https://www.amazon.cn/dp/B00JOS97C6/ref=sr_1_18?m=A2EDK7H33M5FFG&s=amazon-global-store&ie=UTF8&qid=1529852305&sr=1-18'
	},
	{
		productId: 'ferrero_prep',
		type: 'water',
		productType: 'product',
		state: 'prep',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/ferrero.jpg',
		name: 'Ferrero 费列罗 Rocher榛果威化巧克力T3*16 48粒装600g',
		nameEn: 'Ferrero Rocher Hazelnut Chocolate T3*16 48 Capsules 600g',
		value: 149,
		productSrc: 'https://www.amazon.cn/dp/B01HPW4PSI/ref=lp_2134663051_1_7?s=grocery&ie=UTF8&qid=1529852470&sr=1-7'
	},
	{
		productId: 'gucci_prep',
		type: 'earth',
		productType: 'product',
		state: 'prep',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/gucci.jpg',
		name: '女神就是要刚柔并济Gucci 古驰 青竹香水喷雾 50ml',
		nameEn: 'The goddess is to be soft and gentle Gucci Gucci Green Bamboo Eau De Parfum Spray 50ml',
		value: 486,
		productSrc: 'https://www.amazon.cn/dp/B06XF6HH4L/ref=sr_1_1?s=amazon-global-store&ie=UTF8&qid=1529852593&sr=8-1&keywords=%E5%8F%A4%E9%A9%B0%E9%A6%99%E6%B0%B4'
	},
	{
		productId: 'kindle_prep',
		type: 'fire',
		productType: 'product',
		state: 'prep',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/kindle.jpg',
		name: 'Kindle Paperwhite电子书阅读器',
		nameEn: 'Kindle Paperwhite E-book reader',
		value: 958,
		productSrc: 'https://www.amazon.cn/dp/B00QJDOLIO/ref=sr_1_1?s=amazon-devices&ie=UTF8&qid=1529851901&sr=1-1&keywords=kindle%E9%98%85%E8%AF%BB%E5%99%A8'
	},
	{
		productId: 'august_prep',
		type: 'water',
		productType: 'product',
		state: 'prep',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/watch.jpg',
		name: '英国品牌 August 奥科斯 SWB200 智能手环 心率/血氧/疲劳度监测 运动计步睡眠监控 IP67防水',
		nameEn: 'British brand August OXOS SWB200 smart bracelet Heart rate/oxygen/fatigue monitoring Sports step counter sleep monitoring IP67 waterproof',
		value: 309,
		productSrc: 'https://www.amazon.cn/dp/B077SSL2H2/ref=lp_1813550071_1_2?srs=1813550071&ie=UTF8&qid=1529852681&sr=8-2'
	},
	// 虚拟货币部分
	{
		productId: 'eth',
		type: 'fire',
		productType: 'currency',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/ethereum.png',
		name: 'Ethereum',
		nameEn: 'Ethereum',
		value: '3000.46',
		productSrc: ''
	},
	{
		productId: 'eos',
		type: 'water',
		productType: 'currency',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/eos.png',
		name: 'EOS',
		nameEn: 'EOS',
		value: '80.24',
		productSrc: ''
	},
	{
		productId: 'xrp',
		type: 'fire',
		productType: 'currency',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/ripple.png',
		name: 'Ripple',
		nameEn: 'Ripple',
		value: '3.44',
		productSrc: ''
	},
	{
		productId: 'ltc',
		type: 'fire',
		productType: 'currency',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/litecoin.png',
		name: 'Litecoin',
		nameEn: 'Litecoin',
		value: '614.48',
		productSrc: ''
	},
	{
		productId: 'iota',
		type: 'fire',
		productType: 'currency',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/iota.png',
		name: 'Iota',
		nameEn: 'Iota',
		value: '7.73',
		productSrc: ''
	},
	{
		productId: 'cardano',
		type: 'fire',
		productType: 'currency',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/cardano.png',
		name: 'Cardano',
		nameEn: 'Cardano',
		value: '0.99',
		productSrc: ''
	},
	{
		productId: 'menero',
		type: 'fire',
		productType: 'currency',
		state: 'sold',
		imgSrc: 'http://pa5aui85v.sabkt.gdipper.com/monero.png',
		name: 'Menero',
		nameEn: 'Menero',
		value: '772.34',
		productSrc: ''
	}
]

module.exports = {
	LandProductServerModel: LandProductServerModel,
	LandProductClientModel:LandProductClientModel,
	LandProductName: LandProductName,
	LandProductInserData: LandProductInserData
}