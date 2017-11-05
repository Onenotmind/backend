const FeedbackController = require('./controllers/FeedbackController.js')
const koa = require('koa')
const koaRouter = require('koa-router')()
const koaBody = require('koa-body')

const app = new koa()
const port = 7002
const feedbackController = new FeedbackController()

app.use(koaBody())

// 获取评价标签
koaRouter.get('/rating/gettag', feedbackController.gettag)

// 提交新评价
koaRouter.post('/rating/subVisitRating', feedbackController.subVisitRating )

app.use(koaRouter.routes())

app.listen(port)