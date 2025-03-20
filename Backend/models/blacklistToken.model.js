const mongoose = require('mongoose')

const blacklistTokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
);

// Set TTL index to automatically delete documents after 24 hours
blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const BlacklistToken = mongoose.model('BlacklistToken', blacklistTokenSchema);

module.exports = BlacklistToken