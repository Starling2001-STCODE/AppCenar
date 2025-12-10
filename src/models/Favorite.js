const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        comercio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Commerce",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

favoriteSchema.index(
    { cliente: 1, comercio: 1 },
    { unique: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = { Favorite };
