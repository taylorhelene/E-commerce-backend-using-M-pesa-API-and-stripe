let express =  require("express");
let  cors = require("cors");


// initialize express
const app = express()

// middlewares
app.use(express.json())
app.use(cors())

// import routes
let lipaNaMpesaRoutes =  require("./routes")
app.use('/api',lipaNaMpesaRoutes)

const port = process.env.PORT

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})