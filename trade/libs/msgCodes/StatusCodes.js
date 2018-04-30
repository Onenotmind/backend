let CommonCodes = {
	'Service_Wrong': '服务器忙，请稍后再试',
	'Params_Check_Fail': '参数校验失败',
	'Request_Method_Wrong': '请求方式错误！',
	'Token_Fail': 'Token失效',
	'No_Access': '没有权限'
}
let LoginCodes = {
  'Email_Exist': '你的邮件已经注册了！', // 重复邮箱注册
  'Login_DataWrong': '账号密码输入错误', // 账号密码错误
  'Login_Succ': '登陆成功',
  'Login_No_Account': '请先注册',
  'Login_IllegalData': '账号密码输入错误',
  'Register_Failed': '注册失败，请稍后再试',
  'Register_Succ': '注册成功',
  'Params_Check_Fail': '参数校验失败',
  'Mail_Send_Succ': '邮件发送成功！',
  'Mail_Send_Error': '邮件发送失败,请稍后再试',
  'Code_Error': '验证码错误！',
  'Code_Correct': '验证码正确！',
  'Reset_Pass_Succ': '重置密码成功！',
  'Token_Fail': 'Token失效',
  'Get_User_Info': '获取用户信息成功！',
  'Change_Login_Pwd_Succ': '更改登陆密码成功！',
  'Change_Trade_Pwd_Succ': '更改交易密码成功',
  'Change_Login_Pwd_Fail': '更改登陆密码失败，请稍后再试！',
  'Change_Trade_Pwd_Fail': '更改交易密码失败，请稍后再试！',
  'Assets_Data_Normal': '资产数据返回正常！',
	'Assets_Data_Null': '资产数据返回错误！'
}

let AssetsCodes = {
	'Assets_Data_Normal': '资产数据返回正常！',
	'Assets_Data_Null': '资产数据返回错误！',
	'Assets_Null': '资产价值为空'
}

let PandaOwnerCodes = {
	'Query_Panda_Info_Normal': '查询熊猫信息成功！',
	'Already_Gene_Free_Panda': '已经生成过一只G10的熊猫',
	'Gene_Free_Panda_Succ': '生成G10熊猫成功',
	'Query_Panda_By_Addr': '查询地址下所有熊猫成功！',
	'Query_Panda_In_Sold': '查询所有在售是熊猫！'
}

let LandProductCodes = {
	'Get_Star_Point_Succ': '得到商品产生中心成功！',
	'Get_Star_Point_Fail': '商品中心获取失败',
	'Get_Prepare_Product_Fail': '获取投票中的商品失败！',
	'Sell_Product_Fail': '出售商品失败！',
	'Drop_Product_Fail': '下架商品失败',
	'Del_Product_Fail': '删除商品失败!',
	'User_No_Such_Product': '用户未集齐当前商品碎片！',
	'Query_Product_Fail': '查询用户指定商品失败！',
	'Insert_Product_Fail': '插入用户商品失败',
	'Update_Product_Fail': '更新用户商品失败',
	'User_Product_Null': '用户的商品为空！',
	'User_Product_Not_Null': '用户的商品不为空！'
}

let PandaLandCodes = {
	'No_Such_Panda': '没有这只熊猫',
	'No_More_Bamboo_For_Out': '没有足够的竹子！',
	'No_Product_In_Land': '没有物品在搜索范围内！',
	'Update_Panda_Attr_Fail': '更新用户属性失败！',
	'Update_Land_Assets_Fail': '更新用户资产失败',
	'Back_Assets_Carry_Fail': '带回来的商品失败！',
	'Panda_Out_Succ': '熊猫外出搜索成功！',
	'Panda_Not_Sold': '熊猫并非出售',
	'Sell_Panda_Succ': '出售熊猫成功！',
	'Buy_Panda_Fail': '购买熊猫失败',
	'Back_Assets_Carry_Succ': '熊猫带回商品成功!',
	'Drop_Panda_Fail': '熊猫丢弃失败!',
	'Panda_Sire_Succ': '熊猫孵化成功'
}
/**
	{
		status: 0 || 1, // 0为正常返回
		res: {
			data: {}, // 正常返回数据
			status: 0 || 1,
			msg: ''
		},
		msg: ''
	}
*/
function loginAccountFailed () { // 账号密码输错登陆失败返回
	let response = {
		status: 0,
    res: {
      status: 1,
      msg: LoginCodes.Login_DataWrong,
      data: {}
    }
	}
	return response
}

function registerAccountFailed () { // 账号密码输错登陆失败返回
	let response = {
		status: 0,
    res: {
      status: 1,
      msg: LoginCodes.Email_Exist,
      data: {}
    }
	}
	return response
}

function loginIllegalFailed () { // 账号密码格式错误
	let response = {
		status: 0,
    res: {
      status: 1,
      msg: LoginCodes.Login_IllegalData,
      data: {}
    }
	}
	return response
}

function loginErrorRes (msg) {
	let response = {
		status: 0,
    res: {
      status: 1,
      msg: msg,
      data: {}
    }
	}
	return response
}

function loginSuccRes (msg, data) {
	let response = {
		status: 0,
    res: {
      status: 0,
      msg: msg,
      data: data
    }
	}
	return response
}

function errorRes (msg) {
	let response = {
		status: 1,
    res: {
      status: 0,
      msg: msg
    }
	}
	return response
}

function succRes (msg, data) {
	let response = {
		status: 1,
    res: {
      status: 1,
      msg: msg,
      data: data
    }
	}
	return response
}

function serviceError () {
	let response = {
		status: 0,
    msg: CommonCodes.Service_Wrong
	}
	return response
}
function loginSucc (data) {
	let response = {
		status: 0,
    res: {
      status: 1,
      msg: LoginCodes.Login_Succ,
      data: data
    }
	}
	return response
}

module.exports = {
	LoginCodes: LoginCodes,
	loginAccountFailed: loginAccountFailed,
	loginIllegalFailed: loginIllegalFailed,
	loginSucc: loginSucc,
	loginErrorRes: loginErrorRes,
	loginSuccRes: loginSuccRes,
	serviceError: serviceError,
	succRes: succRes,
	errorRes: errorRes,
	AssetsCodes:AssetsCodes,
	PandaOwnerCodes: PandaOwnerCodes,
	CommonCodes: CommonCodes,
	PandaLandCodes: PandaLandCodes,
	LandProductCodes: LandProductCodes
}