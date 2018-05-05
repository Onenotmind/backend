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
	productId: {
		label: 'productId',
		type: 'VARCHAR(10)'
	},
	type: {
		label: 'type',
		type: 'VARCHAR(10)'
	},
	state: {
		label: 'state',
		type: 'VARCHAR(10)'
	},
	time: {
		label: 'time',
		type: 'INT'
	},
	imgSrc: {
		label: 'imgSrc',
		type: 'VARCHAR(100)'
	},
	name: {
		label: 'name',
		type: 'VARCHAR(100)'
	},
	value: {
		label: 'value',
		type: 'INT'
	},
	recommender: {
		label: 'recommender',
		type: 'VARCHAR(20)'
	},
	other: {
		label: 'other',
		type: 'PRIMARY KEY (productId))ENGINE=InnoDB DEFAULT CHARSET=utf8'
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
module.exports = {
	LandProductServerModel: LandProductServerModel,
	LandProductClientModel:LandProductClientModel
}