const { json } = require('express');
const express = require('express');
var jwt = require('jsonwebtoken');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

const requireJsonContent = () => {
    return (req, res, next) => {
        if (req.headers['content-type'] !== 'application/json') {
            res.status(400).send('Server requires application/json')
        } else {
            var today = new Date();
            var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            const final = {
                Date: date,
                Time: time,
                msg: 'Getting time from middleware'
            }
            res.locals.time = final
            next()
        }
    }
}


const verifyToken = (req, res, next)=> {
    loginRole = req.headers.role;
    let obj = {
        Status: 'Error',
        Code: 401,
        content: {
            ErrorMsg: 'Unauthorized request',
        }
    }

    if (!req.headers.authorization) {
        return res.status(401).send(obj)
    }

    let token = req.headers.authorization.split(' ')[1]
    let bearer = req.headers.authorization.split(' ')[0]

    if (bearer !== 'Bearer') {
        return res.status(401).send(obj)
    }

    if (token === 'null') {
        return res.status(401).send(obj)
    }



    try{
        let payload = jwt.verify(token, 'my_secret_key')
        if(payload){
            res.redirect('/');
        }
    } catch (e){
        next()
    }
}


app.get('/', (req, res, next) => {
    res.send('Already logged in / No need to login Wait for 1 min to token exipiration');
});

app.post('/home', requireJsonContent(), (req, res, next) => {
    res.json(res.locals);
})



app.post('/login', verifyToken, (req, res, next) => {
    let user = {
        name: req.body?.name,
        password: req.body?.password
    }
    if (req.body?.name && req.body?.password) {
        if (req.body?.name === 'pradeep' && req.body?.password == 123) {

            const token = jwt.sign({ user },
                'my_secret_key',
                {
                    expiresIn: '1m'
                });
            let obj = {
                access_token: token,
                data: user
            }
            res.json({ token: obj });
        } else {
            res.send('Login Failed');
        }
    } else {
        res.send('Please Provide username and password');

    }
})



app.listen(3000);