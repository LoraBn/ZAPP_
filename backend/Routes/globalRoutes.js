const {Router} = require('express');
const { userSignIn } = require('../controllers/globalUser');
const router = Router();

router.post('/signin', userSignIn);

router.get('/',(req,res)=>{
    res.send('Hello user')
})

module.exports = router;