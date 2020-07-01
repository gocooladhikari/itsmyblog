const LocalStrategy = require('passport-local').Strategy

const User = require('../models/User')

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
            // Match user
            User.findOne({email: email}).then(user => {
                if(!user){
                    done(null, false)
                    console.log('User not registered')
                }else{
                    if(password !== user.password){
                        done(null, false)
                    }else{
                        done(null, user)
                    }
                }
            }).catch(err => console.log(err))
        })
    )

    passport.serializeUser(function(user, done){
        done(null, user.id)
    })
    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user) {
            done(err, user)
        })
    })
}
