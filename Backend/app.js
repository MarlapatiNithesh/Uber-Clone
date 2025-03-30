const dotenv=require('dotenv')
dotenv.config()
const express=require('express')
const cors=require('cors')
const app=express();
const connectToDb=require('./db/db.js')
const userRoutes=require('./routes/user.routes.js')
const captainRoutes=require('./routes/captain.routes.js')
const cookieParser=require('cookie-parser')
const mapRoutes = require('./routes/map.routes.js')
const rideRoutes = require('./routes/ride.routes.js')
connectToDb()

app.use(cors({origin:"https://uber-clone-frontend-s9qu.onrender.com"}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.send('hello world!')
});
app.use('/users',userRoutes)
app.use('/captains',captainRoutes)
app.use('/maps',mapRoutes)
app.use('/rides',rideRoutes)

module.exports=app