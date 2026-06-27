const jwt = require("jsonwebtoken");
const User = require("../Models/UserSchena");




const verifyToken = async (req, res, next) => {
    try {
        let token = req.headers['authorization'];
        if (!token) {
            return res.status(401).send({ message: "No token provided" });
        }
        token = token.split(" ")[1]
        jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
            
            if(err){
                return res.status(401).send({ message: "Unauthorized" });
            } else {
                console.log(decoded);
                   req.user = decoded;
                   next();
            }
         
        })
      
        
    }catch(error){
        
    }
}
module.exports= verifyToken