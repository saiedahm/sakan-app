 module.exports = function handler(req, res) {
    res.status(200).json({
        status: "ok",
        service: "sakan-api",
        message: "Sakan API يعمل على Vercel"
    });
};
