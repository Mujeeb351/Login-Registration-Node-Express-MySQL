const express = require('express')
const router = express.Router()
const userController = require('../controllers/users')

router.get(['/','/index'],(req,res)=>{
    res.render('index')
})

router.get('/register',(req,res)=>{
    res.render('register')
})

router.get('/profile',userController.isLogedIn,(req,res)=>{
    if(req.user){
        res.render('profile',{user:req.user})
    }else{
        res.redirect('/index')
    }

})

router.get('/home',userController.isLogedIn,(req,res)=>{
    if(req.user){
        res.render('home',{user:req.user})
    }else{
        res.redirect('/index')
    }
})

module.exports = router;
