// =====================================================
// SAKAN BACKEND SERVER
// =====================================================

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");

const {
    User,
    Favorite,
    ProfileVisit,
    Message,
    Block,
    Report
} = require("./models");

const {
    authenticateToken,
    generateToken
} = require("./authMiddleware");


const app =
    express();


/* =====================================================
   ENVIRONMENT
===================================================== */

const PORT =
    Number(process.env.PORT) || 5000;

const MONGODB_URI =
    process.env.MONGODB_URI;

const FRONTEND_ORIGIN =
    process.env.FRONTEND_ORIGIN ||
    "https://saiedahm.github.io";


if (!MONGODB_URI) {

    console.error(
        "❌ MONGODB_URI غير موجود في متغيرات البيئة."
    );

    process.exit(1);
}


/* =====================================================
   SECURITY
===================================================== */

app.use(
    helmet()
);


app.use(
    cors({
        origin: [
            FRONTEND_ORIGIN,
            "http://localhost:3000",
            "http://localhost:5000"
        ],
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


app.use(
    express.json({
        limit: "1mb"
    })
);


const apiLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        max:
            150,

        standardHeaders:
            true,

        legacyHeaders:
            false,

        message: {
            error:
                "تم تجاوز عدد الطلبات المسموح بها. حاول بعد قليل."
        }
    });


app.use(
    "/api/",
    apiLimiter
);


/* =====================================================
   HELPERS
===================================================== */

function normalizeGender(
    value
) {

    const gender =
        String(value || "")
            .trim()
            .toLowerCase();


    if (
        [
            "male",
            "man",
            "ذكر",
            "رجل"
        ].includes(gender)
    ) {
        return "male";
    }


    if (
        [
            "female",
            "woman",
            "أنثى",
            "امرأة",
            "بنت",
            "فتاة"
        ].includes(gender)
    ) {
        return "female";
    }


    return null;
}


function calculateAge(
    birthDate
) {

    const birth =
        new Date(birthDate);

    const today =
        new Date();


    if (
        Number.isNaN(
            birth.getTime()
        )
    ) {
        return null;
    }


    let age =
        today.getFullYear() -
        birth.getFullYear();


    const monthDifference =
        today.getMonth() -
        birth.getMonth();


    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() <
            birth.getDate()
        )
    ) {
        age--;
    }


    return age;
}


function oppositeGender(
    gender
) {

    if (gender === "male") {
        return "female";
    }

    if (gender === "female") {
        return "male";
    }

    return null;
}


function publicUser(
    user
) {

    return {
        id:
            user._id,

        memberId:
            user.memberId,

        displayName:
            user.displayName,

        gender:
            user.gender,

        age:
            user.age,

        country:
            user.country,

        city:
            user.city,

        maritalStatus:
            user.maritalStatus,

        language:
            user.language,

        education:
            user.education,

        profession:
            user.profession,

        aboutMe:
            user.aboutMe,

        lookingFor:
            user.lookingFor,

        isOnline:
            user.isOnline,

        isVerified:
            user.isVerified,

        verificationStatus:
            user.verificationStatus,

        mainPhotoUrl:
            user.mainPhotoUrl,

        preferredLanguage:
            user.preferredLanguage,

        createdAt:
            user.createdAt,

        lastSeenAt:
            user.lastSeenAt
    };
}


function publicListUser(
    user
) {

    return {
        id:
            user._id,

        memberId:
            user.memberId,

        displayName:
            user.displayName,

        gender:
            user.gender,

        age:
            user.age,

        country:
            user.country,

        city:
            user.city,

        maritalStatus:
            user.maritalStatus,

        isOnline:
            user.isOnline,

        isVerified:
            user.isVerified,

        mainPhotoUrl:
            user.mainPhotoUrl
    };
}


function isValidObjectId(
    value
) {

    return mongoose.Types.ObjectId.isValid(
        value
    );

}


/* =====================================================
   DATABASE
===================================================== */

mongoose
    .connect(MONGODB_URI)
    .then(() => {

        console.log(
            "✅ تم الاتصال بقاعدة بيانات سكن."
        );

    })
    .catch((error) => {

        console.error(
            "❌ فشل الاتصال بقاعدة البيانات:",
            error.message
        );

        process.exit(1);

    });


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success:
                true,

            service:
                "Sakan API",

            status:
                "online",

            time:
                new Date().toISOString()
        });

    }
);


/* =====================================================
   REGISTER
===================================================== */

app.post(
    "/api/auth/register",
    async (req, res) => {

        try {

            const {
                email,
                password,
                realName,
                displayName,
                gender,
                birthDate,
                country,
                city,
                maritalStatus,
                language,
                education,
                profession,
                aboutMe,
                lookingFor,
                showRealName,
                preferredLanguage
            } = req.body;


            if (
                !email ||
                !password ||
                !realName ||
                !displayName ||
                !gender ||
                !birthDate ||
                !country ||
                !city ||
                !maritalStatus ||
                !language ||
                !education ||
                !profession
            ) {

                return res.status(400).json({
                    error:
                        "جميع البيانات الأساسية مطلوبة."
                });

            }


            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(String(email))
            ) {

                return res.status(400).json({
                    error:
                        "البريد الإلكتروني غير صحيح."
                });

            }


            if (
                String(password).length < 6
            ) {

                return res.status(400).json({
                    error:
                        "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                });

            }


            const normalizedGender =
                normalizeGender(
                    gender
                );


            if (!normalizedGender) {

                return res.status(400).json({
                    error:
                        "قيمة الجنس غير صحيحة."
                });

            }


            const age =
                calculateAge(
                    birthDate
                );


            if (
                age === null ||
                age < 18
            ) {

                return res.status(400).json({
                    error:
                        "يجب أن يكون عمر العضو 18 عامًا أو أكثر."
                });

            }


            const normalizedEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            const existingUser =
                await User.findOne({
                    email:
                        normalizedEmail
                });


            if (existingUser) {

                return res.status(409).json({
                    error:
                        "هذا البريد الإلكتروني مسجل مسبقًا."
                });

            }


            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            let memberId = null;

            let attempts = 0;


            while (
                !memberId &&
                attempts < 10
            ) {

                const candidate =
                    Math.floor(
                        10000000 +
                        Math.random() *
                        89999999
                    );


                const exists =
                    await User.exists({
                        memberId:
                            candidate
                    });


                if (!exists) {
                    memberId =
                        candidate;
                }


                attempts++;

            }


            if (!memberId) {

                return res.status(500).json({
                    error:
                        "تعذر إنشاء رقم العضوية."
                });

            }


            const user =
                await User.create({

                    memberId:

                        memberId,

                    email:

                        normalizedEmail,

                    passwordHash:

                        passwordHash,

                    realName:

                        String(
                            realName
                        ).trim(),

                    displayName:

                        String(
                            displayName
                        ).trim(),

                    gender:

                        normalizedGender,

                    birthDate:

                        new Date(
                            birthDate
                        ),

                    age:

                        age,

                    country:

                        String(
                            country
                        ).trim(),

                    city:

                        String(
                            city
                        ).trim(),

                    maritalStatus:

                        String(
                            maritalStatus
                        ).trim(),

                    language:

                        String(
                            language
                        ).trim(),

                    education:

                        String(
                            education
                        ).trim(),

                    profession:

                        String(
                            profession
                        ).trim(),

                    aboutMe:

                        String(
                            aboutMe || ""
                        ).trim(),

                    lookingFor:

                        String(
                            lookingFor || ""
                        ).trim(),

                    showRealName:
                        Boolean(
                            showRealName
                        ),

                    preferredLanguage:

                        preferredLanguage ||
                        "ar",

                    isOnline:
                        true,

                    lastSeenAt:
                        new Date()

                });


            const token =
                generateToken(
                    user
                );


            res.status(201).json({

                success:
                    true,

                token:

                    token,

                user:
                    publicUser(
                        user
                    )

            });

        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );


            res.status(500).json({
                error:
                    "حدث خطأ أثناء إنشاء الحساب."
            });

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({
                    error:
                        "البريد الإلكتروني وكلمة المرور مطلوبان."
                });

            }


            const user =
                await User.findOne({
                    email:
                        String(email)
                            .trim()
                            .toLowerCase()
                });


            if (!user) {

                return res.status(401).json({
                    error:
                        "بيانات الدخول غير صحيحة."
                });

            }


            const passwordValid =
                await bcrypt.compare(
                    password,
                    user.passwordHash
                );


            if (!passwordValid) {

                return res.status(401).json({
                    error:
                        "بيانات الدخول غير صحيحة."
                });

            }


            if (
                user.isDeactivated
            ) {

                return res.status(403).json({
                    error:
                        "هذا الحساب معطل حاليًا."
                });

            }


            user.isOnline =
                true;

            user.lastSeenAt =
                new Date();

            await user.save();


            const token =
                generateToken(
                    user
                );


            res.json({

                success:
                    true,

                token:

                    token,

                user:
                    publicUser(
                        user
                    )

            });

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            res.status(500).json({
                error:
                    "حدث خطأ أثناء تسجيل الدخول."
            });

        }

    }
);


/* =====================================================
   LOGOUT
===================================================== */

app.post(
    "/api/auth/logout",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                );


            if (user) {

                user.isOnline =
                    false;

                user.lastSeenAt =
                    new Date();

                await user.save();

            }


            res.json({
                success:
                    true
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر تسجيل الخروج."
            });

        }

    }
);


/* =====================================================
   CURRENT USER
===================================================== */

app.get(
    "/api/me",
   /* =====================================================
   UPDATE CURRENT USER PROFILE
===================================================== */

app.put(
    "/api/me",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                );


            if (!user) {

                return res.status(404).json({
                    error:
                        "الحساب غير موجود."
                });

            }


            const {
                realName,
                displayName,
                gender,
                birthDate,
                country,
                city,
                maritalStatus,
                language,
                education,
                profession,
                aboutMe,
                lookingFor,
                showRealName,
                preferredLanguage
            } = req.body;


            /* -----------------------------------------
               REQUIRED DATA
            ----------------------------------------- */

            if (
                !realName ||
                !displayName ||
                !gender ||
                !birthDate ||
                !country ||
                !city ||
                !maritalStatus ||
                !language ||
                !education ||
                !profession
            ) {

                return res.status(400).json({
                    error:
                        "البيانات الأساسية مطلوبة."
                });

            }


            /* -----------------------------------------
               GENDER
            ----------------------------------------- */

            const normalizedGender =
                normalizeGender(
                    gender
                );


            if (
                !normalizedGender
            ) {

                return res.status(400).json({
                    error:
                        "قيمة الجنس غير صحيحة."
                });

            }


            /* -----------------------------------------
               AGE
            ----------------------------------------- */

            const age =
                calculateAge(
                    birthDate
                );


            if (
                age === null ||
                age < 18
            ) {

                return res.status(400).json({
                    error:
                        "يجب أن يكون عمر العضو 18 عامًا أو أكثر."
                });

            }


            /* -----------------------------------------
               UPDATE
            ----------------------------------------- */

            user.realName =
                String(
                    realName
                ).trim();


            user.displayName =
                String(
                    displayName
                ).trim();


            user.gender =
                normalizedGender;


            user.birthDate =
                new Date(
                    birthDate
                );


            user.age =
                age;


            user.country =
                String(
                    country
                ).trim();


            user.city =
                String(
                    city
                ).trim();


            user.maritalStatus =
                String(
                    maritalStatus
                ).trim();


            user.language =
                String(
                    language
                ).trim();


            user.education =
                String(
                    education
                ).trim();


            user.profession =
                String(
                    profession
                ).trim();


            user.aboutMe =
                String(
                    aboutMe || ""
                ).trim();


            user.lookingFor =
                String(
                    lookingFor || ""
                ).trim();


            user.showRealName =
                Boolean(
                    showRealName
                );


            user.preferredLanguage =
                preferredLanguage ||
                language ||
                "ar";


            user.lastSeenAt =
                new Date();


            await user.save();


            /* -----------------------------------------
               RESPONSE
            ----------------------------------------- */

            res.json({

                success:
                    true,

                user:
                    publicUser(
                        user
                    )

            });

        }

        catch (error) {

            console.error(
                "UPDATE PROFILE ERROR:",
                error
            );


            res.status(500).json({
                error:
                    "تعذر حفظ بيانات الملف."
            });

        }

    }
);


/* =====================================================
   HOME MEMBERS
   IMPORTANT:
   Gender comes from authenticated user.
===================================================== */

app.get(
    "/api/members/home",
    authenticateToken,
    async (req, res) => {

        try {

            const currentUser =
                await User.findById(
                    req.user.userId
                ).select(
                    "gender isDeactivated"
                );


            if (!currentUser) {

                return res.status(404).json({
                    error:
                        "الحساب غير موجود."
                });

            }


            if (
                currentUser.isDeactivated
            ) {

                return res.status(403).json({
                    error:
                        "الحساب معطل."
                });

            }


            const targetGender =
                oppositeGender(
                    currentUser.gender
                );


            if (!targetGender) {

                return res.status(400).json({
                    error:
                        "تعذر تحديد قائمة الأعضاء."
                });

            }


            const blockedByMe =
                await Block.find({
                    blockerId:
                        currentUser._id
                }).select(
                    "blockedUserId"
                );


            const blockedIds =
                blockedByMe.map(
                    item =>
                        item.blockedUserId
                );


            const members =
                await User.find({

                    _id: {
                        $ne:
                            currentUser._id,

                        $nin:
                            blockedIds
                    },

                    gender:
                        targetGender,

                    isDeactivated:
                        false

                })
                .sort({
                    isOnline:
                        -1,

                    createdAt:
                        -1
                })
                .limit(50);


            res.json({
                members:
                    members.map(
                        publicListUser
                    )
            });

        } catch (error) {

            console.error(
                "HOME MEMBERS ERROR:",
                error
            );


            res.status(500).json({
                error:
                    "حدث خطأ في جلب الأعضاء."
            });

        }

    }
);


/* =====================================================
   SEARCH MEMBERS
   Gender is enforced by authenticated user.
===================================================== */

app.get(
    "/api/members/search",
    authenticateToken,
    async (req, res) => {

        try {

            const currentUser =
                await User.findById(
                    req.user.userId
                ).select(
                    "gender isDeactivated"
                );


            if (!currentUser) {

                return res.status(404).json({
                    error:
                        "الحساب غير موجود."
                });

            }


            const targetGender =
                oppositeGender(
                    currentUser.gender
                );


            const {
                name = "",
                country = "",
                maritalStatus = "",
                minAge,
                maxAge,
                online
            } = req.query;


            const query = {

                gender:
                    targetGender,

                isDeactivated:
                    false,

                _id: {
                    $ne:
                        currentUser._id
                }

            };


            if (
                String(name).trim()
            ) {

                query.displayName = {
                    $regex:
                        String(name)
                            .trim(),

                    $options:
                        "i"
                };

            }


            if (
                String(country).trim()
            ) {

                query.country =
                    String(
                        country
                    ).trim();

            }


            if (
                String(maritalStatus).trim()
            ) {

                query.maritalStatus =
                    String(
                        maritalStatus
                    ).trim();

            }


            query.age = {
                $gte:
                    Number.isFinite(
                        Number(minAge)
                    )
                        ? Number(minAge)
                        : 18,

                $lte:
                    Number.isFinite(
                        Number(maxAge)
                    )
                        ? Number(maxAge)
                        : 100
            };


            if (
                online === "true"
            ) {

                query.isOnline =
                    true;

            }


            const members =
                await User.find(
                    query
                )
                .sort({
                    isOnline:
                        -1,

                    createdAt:
                        -1
                })
                .limit(50);


            res.json({
                members:
                    members.map(
                        publicListUser
                    )
            });

        } catch (error) {

            console.error(
                "SEARCH ERROR:",
                error
            );


            res.status(500).json({
                error:
                    "حدث خطأ أثناء البحث."
            });

        }

    }
);


/* =====================================================
   MEMBER PROFILE
===================================================== */

app.get(
    "/api/members/:memberId",
    authenticateToken,
    async (req, res) => {

        try {

            const currentUser =
                await User.findById(
                    req.user.userId
                );


            const targetUser =
                await User.findOne({
                    memberId:
                        Number(
                            req.params.memberId
                        ),

                    isDeactivated:
                        false
                });


            if (!targetUser) {

                return res.status(404).json({
                    error:
                        "العضو غير موجود."
                });

            }


            if (
                targetUser.gender !==
                oppositeGender(
                    currentUser.gender
                )
            ) {

                return res.status(403).json({
                    error:
                        "هذا الملف غير متاح ضمن قائمة الأعضاء المسموح بها."
                });

            }


            const blocked =
                await Block.exists({
                    $or: [
                        {
                            blockerId:
                                currentUser._id,

                            blockedUserId:
                                targetUser._id
                        },

                        {
                            blockerId:
                                targetUser._id,

                            blockedUserId:
                                currentUser._id
                        }
                    ]
                });


            if (blocked) {

                return res.status(403).json({
                    error:
                        "لا يمكن الوصول إلى هذا الملف."
                });

            }


            await ProfileVisit.findOneAndUpdate(

                {
                    visitorId:
                        currentUser._id,

                    visitedUserId:
                        targetUser._id
                },

                {
                    $set:
                        {
                            lastVisitedAt:
                                new Date()
                        }
                },

                {
                    upsert:
                        true,

                    new:
                        true,

                    setDefaultsOnInsert:
                        true
                }

            );


            res.json({
                member:
                    publicUser(
                        targetUser
                    )
            });

        } catch (error) {

            console.error(
                "PROFILE ERROR:",
                error
            );


            res.status(500).json({
                error:
                    "تعذر جلب الملف."
            });

        }

    }
);


/* =====================================================
   FAVORITES - GET
===================================================== */

app.get(
    "/api/favorites",
    authenticateToken,
    async (req, res) => {

        try {

            const favorites =
                await Favorite.find({
                    userId:
                        req.user.userId
                })
                .populate(
                    "targetUserId"
                )
                .sort({
                    createdAt:
                        -1
                });


            const result =
                favorites
                    .filter(
                        item =>
                            item.targetUserId &&
                            !item.targetUserId
                                .isDeactivated
                    )
                    .map(
                        item =>
                            publicListUser(
                                item.targetUserId
                            )
                    );


            res.json({
                favorites:
                    result
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر جلب المفضلة."
            });

        }

    }
);


/* =====================================================
   FAVORITES - ADD
===================================================== */

app.post(
    "/api/favorites/:memberId",
    authenticateToken,
    async (req, res) => {

        try {

            const currentUser =
                await User.findById(
                    req.user.userId
                );


            const targetUser =
                await User.findOne({
                    memberId:
                        Number(
                            req.params.memberId
                        ),

                    isDeactivated:
                        false
                });


            if (!targetUser) {

                return res.status(404).json({
                    error:
                        "العضو غير موجود."
                });

            }


            if (
                targetUser.gender !==
                oppositeGender(
                    currentUser.gender
                )
            ) {

                return res.status(403).json({
                    error:
                        "لا يمكن إضافة هذا العضو."
                });

            }


            await Favorite.findOneAndUpdate(

                {
                    userId:
                        currentUser._id,

                    targetUserId:
                        targetUser._id
                },

                {
                    userId:
                        currentUser._id,

                    targetUserId:
                        targetUser._id
                },

                {
                    upsert:
                        true,

                    new:
                        true,

                    setDefaultsOnInsert:
                        true
                }

            );


            res.json({
                success:
                    true,

                message:
                    "تمت إضافة العضو إلى المفضلة."
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر حفظ المفضلة."
            });

        }

    }
);


/* =====================================================
   FAVORITES - REMOVE
===================================================== */

app.delete(
    "/api/favorites/:memberId",
    authenticateToken,
    async (req, res) => {

        try {

            const targetUser =
                await User.findOne({
                    memberId:
                        Number(
                            req.params.memberId
                        )
                });


            if (targetUser) {

                await Favorite.deleteOne({
                    userId:
                        req.user.userId,

                    targetUserId:
                        targetUser._id
                });

            }


            res.json({
                success:
                    true
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر إزالة المفضلة."
            });

        }

    }
);


/* =====================================================
   VISITORS
===================================================== */

app.get(
    "/api/visitors",
    authenticateToken,
    async (req, res) => {

        try {

            const visits =
                await ProfileVisit.find({
                    visitedUserId:
                        req.user.userId
                })
                .sort({
                    lastVisitedAt:
                        -1
                })
                .limit(50)
                .populate(
                    "visitorId"
                );


            const visitors =
                visits
                    .filter(
                        item =>
                            item.visitorId &&
                            !item.visitorId
                                .isDeactivated
                    )
                    .map(
                        item => ({
                            ...publicListUser(
                                item.visitorId
                            ),

                            visitedAt:
                                item.lastVisitedAt
                        })
                    );


            res.json({
                visitors:
                    visitors
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر جلب الزيارات."
            });

        }

    }
);


/* =====================================================
   SEND MESSAGE
===================================================== */

app.post(
    "/api/messages/:memberId",
    authenticateToken,
    async (req, res) => {

        try {

            const text =
                String(
                    req.body.messageText ||
                    ""
                ).trim();


            if (!text) {

                return res.status(400).json({
                    error:
                        "الرسالة فارغة."
                });

            }


            if (text.length > 5000) {

                return res.status(400).json({
                    error:
                        "الرسالة طويلة جدًا."
                });

            }


            const sender =
                await User.findById(
                    req.user.userId
                );


            const recipient =
                await User.findOne({
                    memberId:
                        Number(
                            req.params.memberId
                        ),

                    isDeactivated:
                        false
                });


            if (!recipient) {

                return res.status(404).json({
                    error:
                        "العضو غير موجود."
                });

            }


            if (
                recipient.gender !==
                oppositeGender(
                    sender.gender
                )
            ) {

                return res.status(403).json({
                    error:
                        "لا يمكن إرسال الرسالة لهذا الحساب."
                });

            }


            const blocked =
                await Block.exists({
                    $or: [
                        {
                            blockerId:
                                sender._id,

                            blockedUserId:
                                recipient._id
                        },

                        {
                            blockerId:
                                recipient._id,

                            blockedUserId:
                                sender._id
                        }
                    ]
                });


            if (blocked) {

                return res.status(403).json({
                    error:
                        "لا يمكن إرسال الرسالة بسبب وجود حظر."
                });

            }


            /*
             * هنا سيتم لاحقًا استدعاء AI moderation
             * والترجمة قبل تخزين الرسالة.
             */

            const message =
                await Message.create({

                    senderId:
                        sender._id,

                    recipientId:
                        recipient._id,

                    originalText:
                        text,

                    senderLanguage:
                        sender.preferredLanguage ||
                        sender.language ||
                        "ar",

                    recipientLanguage:
                        recipient.preferredLanguage ||
                        recipient.language ||
                        "ar",

                    moderationStatus:
                        "approved"

                });


            res.status(201).json({

                success:
                    true,

                message: {

                    id:
                        message._id,

                    originalText:
                        message.originalText,

                    createdAt:
                        message.createdAt

                }

            });

        } catch (error) {

            console.error(
                "MESSAGE ERROR:",
                error
            );


            res.status(500).json({
                error:
                    "تعذر إرسال الرسالة."
            });

        }

    }
);


/* =====================================================
   GET CONVERSATION
===================================================== */

app.get(
    "/api/messages/:memberId",
    authenticateToken,
    async (req, res) => {

        try {

            const otherUser =
                await User.findOne({
                    memberId:
                        Number(
                            req.params.memberId
                        ),

                    isDeactivated:
                        false
                });


            if (!otherUser) {

                return res.status(404).json({
                    error:
                        "العضو غير موجود."
                });

            }


            const currentUserId =
                new mongoose.Types.ObjectId(
                    req.user.userId
                );


            const messages =
                await Message.find({

                    $or: [

                        {
                            senderId:
                                currentUserId,

                            recipientId:
                                otherUser._id
                        },

                        {
                            senderId:
                                otherUser._id,

                            recipientId:
                                currentUserId
                        }

                    ],

                    moderationStatus:
                        "approved"

                })
                .sort({
                    createdAt:
                        1
                })
                .limit(200);


            await Message.updateMany(

                {
                    senderId:
                        otherUser._id,

                    recipientId:
                        currentUserId,

                    isRead:
                        false
                },

                {
                    $set:
                        {
                            isRead:
                                true
                        }
                }

            );


            res.json({
                messages:
                    messages
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر جلب المحادثة."
            });

        }

    }
);


/* =====================================================
   BLOCK
===================================================== */

app.post(
    "/api/block/:memberId",
    authenticateToken,
    async (req, res) => {

        try {

            const target =
                await User.findOne({
                    memberId:
                        Number(
                            req.params.memberId
                        )
                });


            if (!target) {

                return res.status(404).json({
                    error:
                        "العضو غير موجود."
                });

            }


            await Block.findOneAndUpdate(

                {
                    blockerId:
                        req.user.userId,

                    blockedUserId:
                        target._id
                },

                {
                    blockerId:
                        req.user.userId,

                    blockedUserId:
                        target._id
                },

                {
                    upsert:
                        true,

                    setDefaultsOnInsert:
                        true
                }

            );


            res.json({
                success:
                    true,

                message:
                    "تم حظر العضو."
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر تنفيذ الحظر."
            });

        }

    }
);


/* =====================================================
   UNBLOCK
===================================================== */

app.delete(
    "/api/block/:memberId",
    authenticateToken,
    async (req, res) => {

        try {

            const target =
                await User.findOne({
                    memberId:
                        Number(
                            req.params.memberId
                        )
                });


            if (target) {

                await Block.deleteOne({
                    blockerId:
                        req.user.userId,

                    blockedUserId:
                        target._id
                });

            }


            res.json({
                success:
                    true
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر إلغاء الحظر."
            });

        }

    }
);


/* =====================================================
   REPORT
===================================================== */

app.post(
    "/api/reports",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                memberId,
                reason,
                details
            } = req.body;


            const allowedReasons = [
                "money_request",
                "scam",
                "insult",
                "inappropriate_content",
                "harassment",
                "threat",
                "suspicious_account",
                "other"
            ];


            if (
                !allowedReasons.includes(
                    reason
                )
            ) {

                return res.status(400).json({
                    error:
                        "سبب الإبلاغ غير صحيح."
                });

            }


            const target =
                await User.findOne({
                    memberId:
                        Number(memberId)
                });


            if (!target) {

                return res.status(404).json({
                    error:
                        "العضو غير موجود."
                });

            }


            await Report.create({

                reporterId:
                    req.user.userId,

                reportedUserId:
                    target._id,

                reason:
                    reason,

                details:
                    String(
                        details || ""
                    ).trim()

            });


            res.status(201).json({
                success:
                    true,

                message:
                    "تم استلام البلاغ للمراجعة."
            });

        } catch {

            res.status(500).json({
                error:
                    "تعذر إرسال البلاغ."
            });

        }

    }
);


/* =====================================================
   404 API
===================================================== */

app.use(
    "/api/",
    (req, res) => {

        res.status(404).json({
            error:
                "مسار API غير موجود."
        });

    }
);


/* =====================================================
   ERROR HANDLER
===================================================== */

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );


        if (res.headersSent) {
            return next(error);
        }


        res.status(500).json({
            error:
                "حدث خطأ غير متوقع في الخادم."
        });

    }
);


/* =====================================================
   START
===================================================== */

app.listen(
    PORT,
    () => {

        console.log(
            `🚀 Sakan API يعمل على المنفذ ${PORT}`
        );

    }
);
