 const jwt = require("jsonwebtoken");

function getJwtSecret() {

    const secret =
        process.env.JWT_SECRET;

    if (!secret) {

        throw new Error(
            "JWT_SECRET غير موجود في ملف البيئة."
        );

    }

    return secret;
}


/* =====================================================
   AUTHENTICATE
===================================================== */

function authenticateToken(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;

    const token =
        authHeader &&
        authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;


    if (!token) {

        return res.status(401).json({
            error:
                "غير مصرح: يرجى تسجيل الدخول."
        });

    }


    try {

        const decoded =
            jwt.verify(
                token,
                getJwtSecret()
            );


        req.user =
            decoded;


        next();

    } catch {

        return res.status(403).json({
            error:
                "رمز الجلسة غير صالح أو منتهي."
        });

    }

}


/* =====================================================
   GENERATE TOKEN
===================================================== */

function generateToken(
    user
) {

    return jwt.sign(
        {
            userId:
                user._id.toString(),

            memberId:
                user.memberId,

            gender:
                user.gender
        },

        getJwtSecret(),

        {
            expiresIn:
                "30d"
        }
    );

}


module.exports = {
    authenticateToken,
    generateToken
};
