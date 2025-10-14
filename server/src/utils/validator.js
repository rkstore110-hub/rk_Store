const validator = require('validator');

const validate = (data) => {
  
  const { firstName , email , password } = data 
  if(!validator.isEmail(email)) throw new Error("Invalid Email")
  if(!validator.isStrongPassword(password)) throw new Error("password is to weak!")

  const requiredFields = ["firstName", "email", "password"]; 

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error("Fields Missing");
    }
  }
};

module.exports = validate;