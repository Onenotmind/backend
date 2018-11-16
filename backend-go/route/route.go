package route

import (
	"backend-go/controller/accountController"
	"github.com/kataras/iris"
)

func RegisterRoute(app *iris.Application) error {
	// v1 接口
	v1 := app.Party("/v1")
	{
		v1.Get("/login", accountController.Login)
	}
	// 404 error handle
	app.OnErrorCode(iris.StatusNotFound, func(ctx iris.Context) {
		ctx.WriteString("404 Not Found")
	})

	return nil
}