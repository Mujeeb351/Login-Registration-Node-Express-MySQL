const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000
const mysql = require('mysql')
const dotenv = require('dotenv')
const path = require('path')
const hbs = require('hbs')
const cookieParser = require('cookie-parser')

dotenv.config({
    path: './.env'
})

const db = mysql.createConnection({
    host        : process.env.DATABASE_HOST,
    user        : process.env.DATABASE_USER,
    password    : process.env.DATABASE_PASS,
    database    : process.env.DATABASE
})

db.connect((err)=>{
    if(err){
        console.error(err);
    }else{
        console.log('Database connection is success...');
    }
}) 

app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

const location = path.join(__dirname, './public')
app.use(express.static(location))
app.set('view engine', 'hbs')

const parsialsPath = path.join(__dirname, 'views', 'partials')
hbs.registerPartials(parsialsPath)

app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))


app.listen(PORT, (req,res)=>{
    console.log(`Listening the port: ${PORT}`);
})