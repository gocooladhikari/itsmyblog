
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()){
            return next()
        }
        res.redirect('/user/login')
    },
    forwardAuthenticated: function(req, res, next){
        if(!req.isAuthenticated()){
            return next()
        }
        res.redirect(`/user/${req.user.slug}/profile`)
    }
}