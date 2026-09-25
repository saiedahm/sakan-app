 const mongoose = require("mongoose");

/* =====================================================
   USER
===================================================== */

const userSchema = new mongoose.Schema(
  {
    memberId: {
      type: Number,
      unique: true,
      required: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    realName: {
      type: String,
      required: true,
      trim: true
    },

    displayName: {
      type: String,
      required: true,
      trim: true
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
      index: true
    },

    birthDate: {
      type: Date,
      required: true
    },

    age: {
      type: Number,
      required: true
    },

    country: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    maritalStatus: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    language: {
      type: String,
      required: true
    },

    education: {
      type: String,
      required: true
    },

    profession: {
      type: String,
      required: true
    },

    aboutMe: {
      type: String,
      default: "",
      maxlength: 600
    },

    lookingFor: {
      type: String,
      default: "",
      maxlength: 600
    },

    showRealName: {
      type: Boolean,
      default: false
    },

    isOnline: {
      type: Boolean,
      default: false,
      index: true
    },

    isDeactivated: {
      type: Boolean,
      default: false,
      index: true
    },

    subscriptionPlan: {
      type: String,
      enum: ["free", "monthly", "annual"],
      default: "free"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    verificationStatus: {
      type: String,
      enum: [
        "not_requested",
        "pending",
        "approved",
        "rejected"
      ],
      default: "not_requested"
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    mainPhotoUrl: {
      type: String,
      default: ""
    },

    preferredLanguage: {
      type: String,
      default: "ar"
    },

    lastSeenAt: {
      type: Date,
      default: null
    }

  },
  {
    timestamps: true
  }
);


/* =====================================================
   FAVORITE
===================================================== */

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index(
  {
    userId: 1,
    targetUserId: 1
  },
  {
    unique: true
  }
);


/* =====================================================
   PROFILE VISIT
===================================================== */

const profileVisitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    visitedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    lastVisitedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

profileVisitSchema.index(
  {
    visitorId: 1,
    visitedUserId: 1
  },
  {
    unique: true
  }
);


/* =====================================================
   MESSAGE
===================================================== */

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    originalText: {
      type: String,
      required: true,
      maxlength: 5000
    },

    translatedText: {
      type: String,
      default: ""
    },

    senderLanguage: {
      type: String,
      default: "ar"
    },

    recipientLanguage: {
      type: String,
      default: "ar"
    },

    moderationStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected"
      ],
      default: "pending"
    },

    isRead: {
      type: Boolean,
      default: false
    },

    deletedBySender: {
      type: Boolean,
      default: false
    },

    deletedByRecipient: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);


/* =====================================================
   BLOCK
===================================================== */

const blockSchema = new mongoose.Schema(
  {
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    blockedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

blockSchema.index(
  {
    blockerId: 1,
    blockedUserId: 1
  },
  {
    unique: true
  }
);


/* =====================================================
   REPORT
===================================================== */

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    reason: {
      type: String,
      enum: [
        "money_request",
        "scam",
        "insult",
        "inappropriate_content",
        "harassment",
        "threat",
        "suspicious_account",
        "other"
      ],
      required: true
    },

    details: {
      type: String,
      default: "",
      maxlength: 3000
    },

    status: {
      type: String,
      enum: [
        "pending",
        "reviewing",
        "resolved",
        "dismissed"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);


/* =====================================================
   EXPORT
===================================================== */

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema
  );

const Favorite =
  mongoose.models.Favorite ||
  mongoose.model(
    "Favorite",
    favoriteSchema
  );

const ProfileVisit =
  mongoose.models.ProfileVisit ||
  mongoose.model(
    "ProfileVisit",
    profileVisitSchema
  );

const Message =
  mongoose.models.Message ||
  mongoose.model(
    "Message",
    messageSchema
  );

const Block =
  mongoose.models.Block ||
  mongoose.model(
    "Block",
    blockSchema
  );

const Report =
  mongoose.models.Report ||
  mongoose.model(
    "Report",
    reportSchema
  );


module.exports = {
  User,
  Favorite,
  ProfileVisit,
  Message,
  Block,
  Report
};
