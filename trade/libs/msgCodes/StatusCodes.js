let CommonCodes = {
	'Service_Wrong': 'CommonCodes_Service_Wrong',
	'Params_Check_Fail': 'CommonCodes_Params_Check_Fail',
	'Request_Method_Wrong': 'CommonCodes_Request_Method_Wrong',
	'Token_Fail': 'CommonCodes_Token_Fail',
	'No_Access': 'CommonCodes_No_Access'
}
let LoginCodes = {
  'Email_Exist': 'LoginCodes_Email_Exist', // 重复邮箱注册
  'Login_DataWrong': 'LoginCodes_Login_DataWrong', // 账号密码错误
  'Login_Succ': 'LoginCodes_Login_Succ',
  'Login_No_Account': 'LoginCodes_Login_No_Account',
  'Login_IllegalData': 'LoginCodes_Login_IllegalData',
  'Register_Failed': 'LoginCodes_Register_Failed',
  'Register_Succ': 'LoginCodes_Register_Succ',
  'Params_Check_Fail': 'LoginCodes_Params_Check_Fail',
  'Mail_Send_Succ': 'LoginCodes_Mail_Send_Succ',
  'Mail_Send_Error': 'LoginCodes_Mail_Send_Error',
  'User_Not_Bind_Email': 'LoginCodes_User_Not_Bind_Email',
  'Query_Email_Succ': 'LoginCodes_Query_Email_Succ',
  'Code_Error': 'LoginCodes_Code_Error',
  'Code_Correct': 'LoginCodes_Code_Correct',
  'Reset_Pass_Succ': 'LoginCodes_Reset_Pass_Succ',
  'Token_Fail': 'LoginCodes_Token_Fail',
  'Get_User_Info': 'LoginCodes_Get_User_Info',
  'Change_Login_Pwd_Succ': 'LoginCodes_Change_Login_Pwd_Succ',
  'Change_Trade_Pwd_Succ': 'LoginCodes_Change_Trade_Pwd_Succ',
  'Change_Login_Pwd_Fail': 'LoginCodes_Change_Login_Pwd_Fail',
  'Change_Trade_Pwd_Fail': 'LoginCodes_Change_Trade_Pwd_Fail',
  'Assets_Data_Normal': 'LoginCodes_Assets_Data_Normal',
  'Assets_Data_Null': 'LoginCodes_Assets_Data_Null',
  'Trade_Pwd_Wrong': 'LoginCodes_Trade_Pwd_Wrong',
  'Get_User_Bamboo': 'LoginCodes_Get_User_Bamboo',
  'Get_Combo_Data_Fail': 'LoginCodes_Get_Combo_Data_Fail'
}

let AssetsCodes = {
	'Assets_Data_Normal': 'AssetsCodes_Assets_Data_Normal',
	'Assets_Data_Null': 'AssetsCodes_Assets_Data_Null',
	'Assets_Null': 'AssetsCodes_Assets_Null'
}

let PandaOwnerCodes = {
	'Query_Panda_Info_Normal': 'PandaOwnerCodes_Query_Panda_Info_Normal',
	'Already_Gene_Free_Panda': 'PandaOwnerCodes_Already_Gene_Free_Panda',
	'Gene_Free_Panda_Succ': 'PandaOwnerCodes_Gene_Free_Panda_Succ',
	'Query_Panda_By_Addr': 'PandaOwnerCodes_Query_Panda_By_Addr',
	'Query_Panda_In_Sold': 'PandaOwnerCodes_Query_Panda_In_Sold',
	'Not_Out_Panda': 'PandaOwnerCodes_Not_Out_Panda'
}

let LandProductCodes = {
	'Get_Star_Point_Succ': 'LandProductCodes_Get_Star_Point_Succ',
	'Get_Star_Point_Fail': 'LandProductCodes_Get_Star_Point_Fail',
	'Get_Prepare_Product_Fail': 'LandProductCodes_Get_Prepare_Product_Fail',
	'Get_Prepare_Product_Succ': 'LandProductCodes_Get_Prepare_Product_Succ',
	'Sell_Product_Fail': 'LandProductCodes_Sell_Product_Fail',
	'Drop_Product_Fail': 'LandProductCodes_Drop_Product_Fail',
	'Del_Product_Fail': 'LandProductCodes_Del_Product_Fail!',
	'User_No_Such_Product': 'LandProductCodes_User_No_Such_Product',
	'Query_Product_Fail': 'LandProductCodes_Query_Product_Fail',
	'Insert_Product_Fail': 'LandProductCodes_Insert_Product_Fail',
	'Update_Product_Fail': 'LandProductCodes_Update_Product_Fail',
	'User_Product_Null': 'LandProductCodes_User_Product_Null',
	'User_Product_Not_Null': 'LandProductCodes_User_Product_Not_Null',
	'Vote_Product_Succ': 'LandProductCodes_Vote_Product_Succ',
	'Vote_Product_Fail': 'LandProductCodes_Vote_Product_Fail',
	'Get_Current_Product_Succ': 'LandProductCodes_Get_Current_Product_Succ',
	'Get_Current_Product_Fail':'LandProductCodes_Get_Current_Product_Fail',
	'Update_User_Bamboo_Succ': 'LandProductCodes_Update_User_Bamboo_Succ',
	'Exchange_Product_Succ': 'LandProductCodes_Exchange_Product_Succ'
}

let PandaLandCodes = {
	'No_Such_Panda': 'PandaLandCodes_No_Such_Panda',
	'No_More_Bamboo_For_Out': 'PandaLandCodes_No_More_Bamboo_For_Out',
	'No_Product_In_Land': 'PandaLandCodes_No_Product_In_Land',
	'Update_Panda_Attr_Fail': 'PandaLandCodes_Update_Panda_Attr_Fail',
	'Update_Land_Assets_Fail': 'PandaLandCodes_Update_Land_Assets_Fail',
	'Back_Assets_Carry_Fail': 'PandaLandCodes_Back_Assets_Carry_Fail',
	'Delete_Back_Assets_Fail': 'PandaLandCodes_Delete_Back_Assets_Fail',
	'Panda_Out_Succ': 'PandaLandCodes_Panda_Out_Succ',
	'Panda_Not_Sold': 'PandaLandCodes_Panda_Not_Sold',
	'Sell_Panda_Succ': 'PandaLandCodes_Sell_Panda_Succ',
	'Unsell_Panda_Succ': 'PandaLandCodes_Unsell_Panda_Succ',
	'Only_One_Unsold_Panda': 'PandaLandCodes_Only_One_Unsold_Panda',
	'Buy_Panda_Fail': 'PandaLandCodes_Buy_Panda_Fail',
	'Buy_Panda_Succ': 'PandaLandCodes_Buy_Panda_Succ',
	'Back_Assets_Carry_Succ': 'PandaLandCodes_Back_Assets_Carry_Succ!',
	'Drop_Panda_Fail': 'PandaLandCodes_Drop_Panda_Fail!',
	'Panda_Sire_Succ': 'PandaLandCodes_Panda_Sire_Succ'
}

let JoiCodes = {
	'Addr_Illegal': 'JoiCodes_Addr_Illegal',
	'Attr_Illegal': 'JoiCodes_Attr_Illegal',
	'Price_Illegal': 'JoiCodes_Price_Illegal',
	'Email_Illegal': 'JoiCodes_Email_Illegal',
	'Pwd_Illegal': 'JoiCodes_Pwd_Illegal',
	'State_Illegal': 'JoiCodes_State_Illegal',
	'Titude_Illegal': 'JoiCodes_Titude_Illegal',
	'ProductAttr_Illegal': 'JoiCodes_ProductAttr_Illegal',
	'Dir_Illegal': 'JoiCodes_Dir_Illegal',
	'ProductId_Illegal': 'JoiCodes_ProductId_Illegal',
	'Phone_Illegal': 'JoiCodes_Phone_Illegal'
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
	LandProductCodes: LandProductCodes,
	JoiCodes: JoiCodes
}