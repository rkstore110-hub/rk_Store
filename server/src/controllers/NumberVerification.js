// const axios = require('axios');
// const baseURL = 'https://cpaas.messagecentral.com';
// const User = require("../models/user");

// // Example list of temp SMS providers' numbers/prefixes
// const TEMP_NUMBER_PREFIXES = [
//   // UK virtual numbers
//   "447520", "447781", "447404", "447480", "447937",
//   // US disposable ranges
//   "12512", "12513", "12514", "14703", "14704", "14705",
//   // Canada
//   "14388", "14389", "15878", "15879",
//   // India virtual
//   "917011", "917012", "917013", "919028", "919029",
//   // UAE temp ranges
//   "97158", "97156", "97157",
//   // Australia virtual
//   "61437", "61438", "61439",
//   // France
//   "33756", "33757", "33758",
//   // Germany
//   "49157", "49159", "49160",
//   // Russia
//   "79215", "79216", "79217",
//   // More global common disposable services
//   "447404", "447937", "48500", "48501", "37060", "37061",
//   "39351", "39352", "35193", "35194", "35845", "35846","+1000", "+1001", "+1002", "+1003", "+1004", "+1005", "+1006", "+1007", "+1008", "+1009",
//   "+4410", "+4411", "+4412", "+4413", "+4414", "+4415", "+4416", "+4417", "+4418", "+4419",
//   "+9110", "+9111", "+9112", "+9113", "+9114", "+9115", "+9116", "+9117", "+9118", "+9119",
//   "+6100", "+6101", "+6102", "+6103", "+6104", "+6105", "+6106", "+6107", "+6108", "+6109",
//   "+3300", "+3301", "+3302", "+3303", "+3304", "+3305", "+3306", "+3307", "+3308", "+3309"
// ];


// // Simple check function
// function isTempNumber(mobileNumber) {
//   return TEMP_NUMBER_PREFIXES.some(prefix => mobileNumber.startsWith(prefix));
// }

// async function getAuthToken() {
//   const key = Buffer.from(process.env.MC_PASSWORD).toString('base64');
//   const params = {
//     customerId: process.env.MC_CUSTOMER_ID,
//     email: process.env.MC_EMAIL,
//     key,
//     scope: 'NEW'
//   };
//   const url = `${baseURL}/auth/v1/authentication/token`;
//   const res = await axios.get(url, { params });
//   return res.data.token;
// }

// async function CheckphoneNo(req, res) {
//   try {
//     const { phoneNumber } = req.body; // Changed from 'number' to 'phoneNumber'
//     const userId = req.user.id; // Get user ID from middleware instead of body
    
//     const userInfo = await User.findById(userId);
//     if (!userInfo) {
//       return res.status(404).json({
//         success: false,
//         message: "User does not exist"
//       });
//     }
    
//     // Clean phone number (remove non-digits)
//     const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
//     const userPhoneNo = userInfo.phoneNo ? userInfo.phoneNo.replace(/\D/g, '') : '';
    
//     if (userPhoneNo === cleanPhoneNumber && userInfo.isPhoneVerified) {
//       res.status(200).json({
//         success: true,
//         isVerified: true,
//         message: "Phone number is already verified"
//       });
//     } else {
//       res.status(200).json({
//         success: true,
//         isVerified: false,
//         message: "Phone number needs verification"
//       });
//     }
//   } catch (e) {
//     console.error('CheckphoneNo Error:', e);
//     res.status(500).json({
//       success: false,
//       message: e.message || "Internal server error"
//     });
//   }
// }


// async function sendOtp(req, res) {
//   const { countryCode, mobileNumber } = req.body;
//   if (!countryCode || !mobileNumber) {
//     return res.status(400).json({ success: false, message: 'countryCode and mobileNumber are required' });
//   }

//   // Check if number is from temp/disposable range
//   if (isTempNumber(mobileNumber)) {
//     return res.status(400).json({
//       success: false,
//       message: 'Temporary/disposable numbers are not allowed'
//     });
//   }

//   try {
//     const token = await getAuthToken();
//     const params = {
//       customerId: process.env.MC_CUSTOMER_ID,
//       countryCode,
//       flowType: 'SMS',
//       mobileNumber
//     };
//     const url = `${baseURL}/verification/v3/send`;
//     const response = await axios.post(url, null, { params, headers: { authToken: token }});
//     const data = response.data.data;
//     if (response.data.responseCode === 200 && !data.errorMessage) {
//       return res.status(200).json({
//         success: true,
//         message: 'OTP sent successfully',
//         verificationId: data.verificationId,
//         timeout: data.timeout
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Failed to send OTP',
//         error: data.errorMessage || response.data.message
//       });
//     }
//   } catch (err) {
//     console.error('Error sending OTP:', err);
//     res.status(500).json({ success: false, message: 'Server error sending OTP' });
//   }
// }


// async function verifyOtp(req, res) {
//   const { countryCode, mobileNumber, verificationId, code } = req.body;
//   const userId = req.user.id; // Get from middleware instead of body
  
//   if (!countryCode || !mobileNumber || !verificationId || !code) {
//     return res.status(400).json({ 
//       success: false, 
//       message: 'countryCode, mobileNumber, verificationId, and code are required' 
//     });
//   }
  
//   try {
//     const token = await getAuthToken();
//     const params = {
//       customerId: process.env.MC_CUSTOMER_ID,
//       countryCode,
//       mobileNumber,
//       verificationId,
//       code
//     };
//     const url = `${baseURL}/verification/v3/validateOtp`;
//     const response = await axios.get(url, { params, headers: { authToken: token }});
//     const data = response.data.data;
    
//     if (data.verificationStatus === 'VERIFICATION_COMPLETED' && !data.errorMessage) {
//       // Update user's phone number
//       const user = await User.findById(userId);
//       if (user) {
//         user.phoneNo = mobileNumber; // Save as string
//         user.isPhoneVerified = true; // Add this line
//         await user.save();
//       }
      
//       return res.status(200).json({ 
//         success: true, 
//         message: 'OTP verified successfully' 
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'OTP verification failed',
//         error: data.errorMessage || response.data.message
//       });
//     }
//   } catch (err) {
//     console.error('Error verifying OTP:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error verifying OTP' 
//     });
//   }
// }



// module.exports = { sendOtp, verifyOtp , CheckphoneNo };



const axios = require('axios');
const baseURL = 'https://cpaas.messagecentral.com';
const User = require("../models/user");

// Enhanced temp SMS providers' numbers/prefixes with better detection
const TEMP_NUMBER_PREFIXES = [
  // UK virtual numbers
  "447520", "447781", "447404", "447480", "447937",
  // US disposable ranges  
  "12512", "12513", "12514", "14703", "14704", "14705",
  // Canada
  "14388", "14389", "15878", "15879",
  // India virtual (problematic ones)
  "917011", "917012", "917013", "919028", "919029",
  // UAE temp ranges
  "97158", "97156", "97157",
  // Australia virtual
  "61437", "61438", "61439",
  // France
  "33756", "33757", "33758",
  // Germany
  "49157", "49159", "49160",
  // Russia
  "79215", "79216", "79217",
  // More global disposable services
  "48500", "48501", "37060", "37061",
  "39351", "39352", "35193", "35194", "35845", "35846",
  // Test numbers (common in development)
  "+1000", "+1001", "+1002", "+1003", "+1004", "+1005", 
  "+4410", "+4411", "+4412", "+4413", "+4414", "+4415",
  "+9110", "+9111", "+9112", "+9113", "+9114", "+9115",
  "+6100", "+6101", "+6102", "+6103", "+6104", "+6105",
  "+3300", "+3301", "+3302", "+3303", "+3304", "+3305"
];

// Enhanced temp number detection
function isTempNumber(mobileNumber) {
  // Clean the number first
  const cleanNumber = mobileNumber.replace(/\D/g, '');
  
  // Check against known prefixes
  const isTempPrefix = TEMP_NUMBER_PREFIXES.some(prefix => {
    const cleanPrefix = prefix.replace(/\D/g, '');
    return cleanNumber.startsWith(cleanPrefix);
  });
  
  // Additional patterns for common temp services
  const commonTempPatterns = [
    /^91(0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)/, // India repetitive
    /^1(0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)/, // US repetitive
    /^(123456|111111|000000|999999|555555)/, // Common test patterns
  ];
  
  const matchesPattern = commonTempPatterns.some(pattern => pattern.test(cleanNumber));
  
  return isTempPrefix || matchesPattern;
}

async function getAuthToken() {
  try {
    const key = Buffer.from(process.env.MC_PASSWORD).toString('base64');
    const params = {
      customerId: process.env.MC_CUSTOMER_ID,
      email: process.env.MC_EMAIL,
      key,
      scope: 'NEW'
    };
    const url = `${baseURL}/auth/v1/authentication/token`;
    const res = await axios.get(url, { params });
    return res.data.token;
  } catch (error) {
    console.error('Auth token error:', error);
    throw new Error('Failed to get authentication token');
  }
}

async function CheckphoneNo(req, res) {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user.id;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }
    
    const userInfo = await User.findById(userId);
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        message: "User does not exist"
      });
    }
    
    // Clean phone number comparison (handle different formats)
    const cleanInputPhone = phoneNumber.replace(/\D/g, '');
    let userPhoneClean = '';
    
    if (userInfo.phoneNo) {
      const userPhoneStr = userInfo.phoneNo.toString();
      // Handle +91 8590863462 format
      if (userPhoneStr.startsWith('+91 ')) {
        userPhoneClean = userPhoneStr.substring(4).replace(/\D/g, '');
      } 
      // Handle 918590863462 format
      else if (userPhoneStr.startsWith('91') && userPhoneStr.length === 12) {
        userPhoneClean = userPhoneStr.substring(2);
      }
      // Handle 8590863462 format
      else {
        userPhoneClean = userPhoneStr.replace(/\D/g, '');
      }
    }
    
    console.log('📞 Phone check:', {
      inputPhone: cleanInputPhone,
      userPhone: userPhoneClean,
      isVerified: userInfo.isPhoneVerified,
      match: userPhoneClean === cleanInputPhone
    });
    
    if (userPhoneClean === cleanInputPhone && userInfo.isPhoneVerified) {
      return res.status(200).json({
        success: true,
        isVerified: true,
        message: "Phone number is already verified"
      });
    } else {
      return res.status(200).json({
        success: true,
        isVerified: false,
        message: "Phone number needs verification"
      });
    }
  } catch (e) {
    console.error('CheckphoneNo Error:', e);
    res.status(500).json({
      success: false,
      message: e.message || "Internal server error"
    });
  }
}

async function sendOtp(req, res) {
  const { countryCode, mobileNumber } = req.body;
  
  if (!countryCode || !mobileNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'countryCode and mobileNumber are required' 
    });
  }

  // Enhanced validation for Indian numbers
  if (countryCode === '91') {
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    
    // Check length
    if (cleanNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Indian mobile numbers must be 10 digits'
      });
    }
    
    // Check if starts with valid digit
    if (!['6', '7', '8', '9'].includes(cleanNumber[0])) {
      return res.status(400).json({
        success: false,
        message: 'Indian mobile numbers must start with 6, 7, 8, or 9'
      });
    }
  }

  // Check if number is from temp/disposable range
  const fullNumber = countryCode + mobileNumber;
  if (isTempNumber(fullNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Temporary or disposable phone numbers are not allowed for security reasons'
    });
  }

  try {
    const token = await getAuthToken();
    const params = {
      customerId: process.env.MC_CUSTOMER_ID,
      countryCode,
      flowType: 'SMS',
      mobileNumber: mobileNumber.replace(/\D/g, '') // Clean the number
    };
    
    console.log('📤 Sending OTP:', params);
    
    const url = `${baseURL}/verification/v3/send`;
    const response = await axios.post(url, null, { 
      params, 
      headers: { authToken: token }
    });
    
    const data = response.data.data;
    
    if (response.data.responseCode === 200 && !data.errorMessage) {
      console.log('✅ OTP sent successfully:', data.verificationId);
      
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        verificationId: data.verificationId,
        timeout: data.timeout || 300 // Default 5 minutes
      });
    } else {
      console.error('❌ OTP send failed:', data);
      
      return res.status(400).json({
        success: false,
        message: 'Failed to send OTP',
        error: data.errorMessage || response.data.message
      });
    }
  } catch (err) {
    console.error('❌ Error sending OTP:', err);
    
    // Handle specific error cases
    if (err.response?.status === 429) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many requests. Please try again later.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error sending OTP. Please try again.' 
    });
  }
}

async function verifyOtp(req, res) {
  const { countryCode, mobileNumber, verificationId, code } = req.body;
  const userId = req.user.id;
  
  if (!countryCode || !mobileNumber || !verificationId || !code) {
    return res.status(400).json({ 
      success: false, 
      message: 'countryCode, mobileNumber, verificationId, and code are required' 
    });
  }
  
  try {
    const token = await getAuthToken();
    const params = {
      customerId: process.env.MC_CUSTOMER_ID,
      countryCode,
      mobileNumber: mobileNumber.replace(/\D/g, ''),
      verificationId,
      code
    };
    
    console.log('🔐 Verifying OTP:', { ...params, code: '****' });
    
    const url = `${baseURL}/verification/v3/validateOtp`;
    const response = await axios.get(url, { 
      params, 
      headers: { authToken: token }
    });
    
    const data = response.data.data;
    
    if (data.verificationStatus === 'VERIFICATION_COMPLETED' && !data.errorMessage) {
      // Update user's phone number with proper formatting
      const user = await User.findById(userId);
      if (user) {
        const cleanMobileNumber = mobileNumber.replace(/\D/g, '');
        user.phoneNo = `+${countryCode} ${cleanMobileNumber}`; // Format as +91 8590863462
        user.isPhoneVerified = true; // This fixes the "pending" issue
        await user.save();
        
        console.log('✅ Phone verified and saved:', {
          userId,
          phoneNo: user.phoneNo,
          isPhoneVerified: user.isPhoneVerified
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Phone number verified successfully' 
      });
    } else {
      console.error('❌ OTP verification failed:', data);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.',
        error: data.errorMessage || response.data.message
      });
    }
  } catch (err) {
    console.error('❌ Error verifying OTP:', err);
    
    // Handle specific error cases
    if (err.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during verification. Please try again.' 
    });
  }
}

module.exports = { sendOtp, verifyOtp, CheckphoneNo };
