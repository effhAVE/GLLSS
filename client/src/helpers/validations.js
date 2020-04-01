function required(value) {
  return !!value || "This field is required";
}

export default {
  required: [required],
  nickname: [
    required,
    v => v.length >= 2 || "Nickname must be at least 2 characters long",
    v => v.length <= 50 || "Nickname must be less than 50 characters",
  ],
  email: [
    required,
    v => /.+@.+\..+/.test(v) || "Not a valid email address",
    v => v.length >= 5 || "Email must be at least 5 characters long",
    v => v.length <= 255 || "Email must be less than 120 characters",
  ],
  password: [
    required,
    v => v.length >= 5 || "Password must be at least 5 characters long",
    v => v.toLowerCase() !== v || "Password must contain at least 1 capital letter",
    v => /\d/.test(v) || "Password must contain at least 1 digit",
  ],
  roundName: [
    required,
    v => v.length >= 2 || "Round name must be at least 2 characters long",
    v => v.length <= 40 || "Round name must be less than 40 characters",
  ],
  tournamentName: [
    required,
    v => v.length >= 5 || "Tournament name must be at least 5 characters long",
    v => v.length <= 120 || "Tournament name must be less than 120 characters",
  ],
  seriesName: [
    required,
    v => v.length >= 2 || "Series name must be at least 5 characters long",
    v => v.length <= 120 || "Series name must be less than 120 characters",
  ],
  startDate: [
    required,
    v => typeof new Date(v) === "object" || "Start date must be a correct date value"
  ],
  endDate: [
    required,
    v => typeof new Date(v) === "object" || "End date must be a correct date value"
  ],
  bestOf: [
    required,
    v => +v >= 1 || "Best of must be a positive number",
  ],
  prepTime: [
    required,
    v => v >= 0 || "Preparation time cannot be negative",
    v => v <= 180 || "Preparation time cannot be greater than 180"
  ]
}