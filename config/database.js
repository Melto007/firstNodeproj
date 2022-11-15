const mongoose  = require('mongoose')
const { MONGODB } = process.env

exports.connect = () => {
    mongoose.connect(MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log('DB is connected'))
    .catch(error => {
        console.log('Unable to connect mongodb')
        console.log(error)
        process.exit(1)
    })
}