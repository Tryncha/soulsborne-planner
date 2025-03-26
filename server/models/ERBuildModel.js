const mongoose = require('mongoose');

const AttributesSchema = new mongoose.Schema(
  {
    vigor: {
      type: Number,
      min: 1,
      max: 99,
      required: true
    },
    mind: {
      type: Number,
      min: 1,
      max: 99,
      required: true
    },
    endurance: {
      type: Number,
      min: 1,
      max: 99,
      required: true
    },
    strength: {
      type: Number,
      min: 1,
      max: 99,
      required: true
    },
    dexterity: {
      type: Number,
      min: 1,
      max: 99,
      required: true
    },
    intelligence: {
      type: Number,
      min: 1,
      max: 99,
      required: true
    },
    faith: {
      type: Number,
      min: 1,
      max: 99,
      required: true
    },
    arcane: {
      type: Number,
      min: 1,
      max: 99,
      required: true
    }
  },
  {
    _id: false
  }
);

const HandEquipmentSchema = new mongoose.Schema(
  {
    name: String,
    upgrade: {
      name: String,
      level: Number
    }
  },
  {
    _id: false
  }
);

const EquipmentSchema = new mongoose.Schema(
  {
    hands: {
      right: [HandEquipmentSchema],
      left: [HandEquipmentSchema]
    },
    armor: {
      head: String,
      chest: String,
      hands: String,
      legs: String
    },
    rings: [String],
    items: [String]
  },
  {
    _id: false
  }
);

const ERBuildSchema = new mongoose.Schema(
  {
    title: {
      // Build name !== Character name
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 50, // Propense to changes
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    anonymousUserId: String,
    expiresAt: Date,
    game: {
      type: String,
      default: 'ER'
    },
    description: {
      // Build info or notes about build by author
      type: String,
      trim: true,
      maxLength: 50 // Propense to changes
    },
    isPublic: {
      type: Boolean,
      default: false,
      required: true
    },
    tags: [String],
    url: {
      // To share the build
      type: String,
      trim: true
    },
    views: Number,
    votes: Number,
    character: {
      name: {
        type: String,
        trim: true,
        maxLength: 16 // maxLength based in game
      },
      gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
      },
      startingClass: {
        type: String,
        required: true
      },
      startingGift: String,
      covenant: {
        type: String
      },
      humanity: Number,
      attributes: AttributesSchema,
      equipment: EquipmentSchema,
      spells: [String]
    }
  },
  {
    timestamps: true
  }
);

// Expiration configuration
ERBuildSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

ERBuildSchema.set('toJSON', {
  transform: (document, returnedBuild) => {
    returnedBuild.id = returnedBuild._id.toString();
    delete returnedBuild._id;
    delete returnedBuild.__v;
  }
});

const ERBuildModel = mongoose.model('ERBuild', ERBuildSchema);

module.exports = ERBuildModel;
