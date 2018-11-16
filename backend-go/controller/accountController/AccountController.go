package accountController

import (
	"github.com/kataras/iris"
)

func Login(context iris.Context) {
	context.JSON(iris.Map{
		"message": "login interface",
	})
}