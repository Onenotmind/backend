package main

import (
	"github.com/kataras/iris"
	"github.com/kataras/iris/middleware/recover"
	"github.com/kataras/iris/middleware/logger"
)

func main() {
	app := iris.Default()
	// Recover middleware recovers from any panics and writes a 500 if there was one.
	app.Use(recover.New())

	requestLogger := logger.New(logger.Config{
			// Status displays status code
			Status: true,
			// IP displays request's remote address
			IP: true,
			// Method displays the http method
			Method: true,
			// Path displays the request path
			Path: true,
			// Query appends the url query to the Path.
			Query: true,

			// if !empty then its contents derives from `ctx.Values().Get("logger_message")
			// will be added to the logs.
			MessageContextKeys: []string{"logger_message"},

			// if !empty then its contents derives from `ctx.GetHeader("User-Agent")
			MessageHeaderKeys: []string{"User-Agent"},
	})
	app.Use(requestLogger)
	// app.Use(route.RegisterRoute)
	app.Get("/ping", func(ctx iris.Context) {
		ctx.JSON(iris.Map{
			"message": "pong",
		})
	})
	app.Run(iris.Addr(":8080"))
}