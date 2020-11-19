module.exports = {
  overviewTournamentsLimitActive: {
    type: Number,
    default: 5,
    required: true,
    min: [1, "Cannot be lower than 1"],
    max: [15, "Cannot be higher than 15"]
  },
  overviewTournamentsLimitPast: {
    type: Number,
    default: 10,
    required: true,
    min: [5, "Cannot be lower than 5"],
    max: [30, "Cannot be higher than 30"]
  },
  tournamentsLimitActive: {
    type: Number,
    default: 10,
    required: true,
    min: [5, "Cannot be lower than 5"],
    max: [30, "Cannot be higher than 30"]
  },
  tournamentsLimitPast: {
    type: Number,
    default: 10,
    required: true,
    min: [5, "Cannot be lower than 5"],
    max: [30, "Cannot be higher than 30"]
  },
  seriesTournamentsLimit: {
    type: Number,
    default: 10,
    required: true,
    min: [5, "Cannot be lower than 5"],
    max: [30, "Cannot be higher than 30"]
  },
  privateEmail: {
    type: Boolean,
    default: true,
    required: true
  },
  displayOnlyMyAccounts: {
    type: Boolean,
    default: false,
    required: true
  },
  displayOnlyMyCodes: {
    type: Boolean,
    default: false,
    required: true
  }
};
