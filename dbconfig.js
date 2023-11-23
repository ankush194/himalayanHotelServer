const mongoose = require("mongoose") ;

const db_url = process.env.db_url ;

connectDb().catch(err => console.log(err));

async function connectDb() {
    await mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.database, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log("db connected");
}

module.exports = mongoose ;