const mongoose = require('mongoose');
const { Schema } = mongoose;

const AddBannerSchema = Schema({
    BannerUrl:{
        type:String,
        required:true
    },
    BannerTitle:{
        type:String,
        required:true
    },
    Banner_public_id:{
        type:String,
        required:true
    }
},{ timestamps:true });

const Banners = mongoose.model('banners',AddBannerSchema);
module.exports = Banners;