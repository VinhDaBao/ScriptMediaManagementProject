import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: String,
  price: Number,

  limits: {
    workspace: Number,
    projects: Number,
    assets: Number,
    worlds: Number,
    members: Number,
  },

  features: {
    tts: {
      enabled: {
        type: Boolean,
        default: false,
      },

      premiumVoice: {
        type: Boolean,
        default: false,
      },

      monthlyCharacterLimit: {
        type: Number,
        default: 0,
      },
    },

    snapshots: {
      enabled: {
        type: Boolean,
        default: true,
      },

      maxSnapshotsPerProject: {
        type: Number,
        default: 10,
      },
    },

    collaboration: {
      enabled: {
        type: Boolean,
        default: false,
      },
    },
  },
});

const Plan = mongoose.model('Plan', planSchema);
export default Plan;