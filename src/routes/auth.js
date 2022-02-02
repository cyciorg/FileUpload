async function auth(req, res) {
    if (!req.isAuthenticated()) return res.status(401).send('Unauthorized');
    if (req.user.roles[0] < roles.ADMIN) return res.status(401).send('Unauthorized');
    // hold off until rate limit and  upload is fully reworked
}