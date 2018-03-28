let CommonCodes = {
	'Service_Wrong': '服务器忙，请稍后再试',
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
  'Token_Fail': 'Token失效'
}

let AssetsCodes = {
	'Assets_Data_Normal': '资产数据返回正常！',
	'Assets_Data_Null': '资产数据返回错误！'
}

let PandaOwnerCodes = {
	'Query_Panda_Info_Normal': '查询熊猫信息成功！'
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
		status: 0,
    res: {
      status: 1,
      msg: msg,
      data: {}
    }
	}
	return response
}

function succRes (msg, data) {
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

function serviceError () {
	let response = {
		status: 1,
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
	PandaOwnerCodes: PandaOwnerCodes
}