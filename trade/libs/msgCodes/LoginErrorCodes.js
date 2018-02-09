let CommonCodes = {
	'Service_Wrong': '服务器忙，请稍后再试',
}
let LoginCodes = {
  'Email_Exist': '你的邮件已经注册了！', // 重复邮箱注册
  'Login_DataWrong': '账号密码输入错误', // 账号密码错误
  'Login_Succ': '登陆成功',
  'Login_IllegalData': '账号密码输入错误'
}

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
	loginErrorRes: loginErrorRes
}