const jwt = require('jsonwebtoken');
required('dotenv').config();
const UserAuth=(req, res, next)=>{
  const token=  req.header['Authorization']?.splite(' ')[1];
  if(!token){
    res.status(401).json({message:'token missing'});
  }else{
jwt.verify(
  token,
  process.env.JWT_SECRET,
  (err,payload)=>{
    if(err){
      console.log(err);
      res.status(500).json(err);
  
      
    }else{
      req.user=payload;
    }
  }
)
  }

}
module.exports= UserAuth;