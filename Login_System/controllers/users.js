const mysql = require('mysql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')

const db = mysql.createConnection({
    host        : process.env.DATABASE_HOST,
    user        : process.env.DATABASE_USER,
    password    : process.env.DATABASE_PASS,
    database    : process.env.DATABASE
})

exports.register = (req,res)=>{
    console.log(req.body);
    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const confirm_password = req.body.confirm_password;
    //res.send('Form Submitted...');

    const {name, email, password, confirm_password} = req.body;
    db.query('select email from users where email = ?',
    [email],
    async(err,result)=>{
        if(err){
            console.log(err);
        }

        if(result.length > 0){
            return res.render('register', {msg: "The email id already exists!", msg_type:"error"})
        }else if(password !== confirm_password){
            return res.render('register', {msg: "Password doesn't Match!", msg_type:"error"})
        }

        let hasedPassword = await bcrypt.hash(password, 8);
        console.log(hasedPassword);

        db.query('insert into users set ?',
        {name:name, email:email, pass: hasedPassword},
        (err,result)=>{
            if(err){
                console.err(err);
            }else{
                console.log(result);
                return res.render('register', {msg: "user registration success...", msg_type:"good"})
            }
        })

    })

}

exports.index = async (req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).render('index', {
                msg:"Please enter your email or password", 
                msg_type:"error"
            })
        }

        db.query('select * from users where email = ?',
        [email], 
        async(err,result)=>{
            console.log(result);
            if(result.length <= 0){
                return res.status(401).render('index', {
                    msg: "Email or Password is incorrect...",
                    msg_type:"error"})
            }else{
                if(!(await bcrypt.compare(password, result[0].PASS))){
                    return res.status(401).render('index', {
                        msg: "Email or Password is incorrect...",
                        msg_type:"error"})
                }else{
                    const id = result[0].ID;
                    const token = jwt.sign({id:id},process.env.JWT_SECRET,{
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });
                    console.log('The token is: ' + token);
                    const cookieOption = {
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                            ),
                            httpOnly: true,
                    };
                    res.cookie("mujeeb", token,cookieOption);
                    res.status(200).redirect('/home')
                }
            }
            
        })

        
    } catch (error) {
        console.log(error);
    }
}

exports.isLogedIn = async (req,res,next)=>{
    if(req.cookies.mujeeb){
        try{
        const decode = await promisify(jwt.verify)(
            req.cookies.mujeeb, 
            process.env.JWT_SECRET)
        //console.log(decode);
        db.query('select * from users where id = ?',[decode.id],(err,result)=>{
            //console.log(result);
            if(!result){
                return next()
            }
            req.user = result[0]
            return next()
       })
    }catch(error){
        console.log(error);
        return next();
    }
    }else{
        return next();
    }
   
}

exports.logout = async(req,res)=>{
    res.cookie('mujeeb','logout',{
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true,
    });
    res.status(200).redirect('/')
}