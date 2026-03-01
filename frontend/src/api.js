import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

export async function registerUser(username, email, password, behavior_vector) {
  try {
    const { data } = await api.post("/register", { username, email, password, behavior_vector });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || "Registration failed");
  }
}

export async function loginUser(username, password, behavior_vector) {
  try {   
    const { data } = await api.post("/login", { username, password, behavior_vector });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || "Login failed");
  }
}

export async function verifyOTP(user_id, otp, behavior_vector) {
  try {
    const { data } = await api.post("/verify-otp", { user_id, otp, behavior_vector });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || "OTP verification failed");
  }
}






// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   headers: { "Content-Type": "application/json" },
// });


//   // export const getBehaviorVector = () => [0.2, 0.5, 0.7, 0.3];
//   // // Array.from({ length: 5 }, () => parseFloat(Math.random().toFixed(4)));

// export async function registerUser(username, password, behavior_vector) {
//   try {
//     const { data } = await api.post("/register", { username, password, behavior_vector });
//     return data;
//   } catch (err) {
//     throw new Error(err.response?.data?.detail || "Registration failed");
//   }
// }

// export async function loginUser(username, password, behavior_vector) {
//   try {
//     const { data } = await api.post("/login", { username, password, behavior_vector });
//     return data;
//   } catch (err) {
//     throw new Error(err.response?.data?.detail || "Login failed");
//   }
// }

// export async function verifyOTP(user_id, otp, behavior_vector) {
//   try {
//     const { data } = await api.post("/verify-otp", { user_id, otp, behavior_vector });
//     return data;
//   } catch (err) {
//     throw new Error(err.response?.data?.detail || "OTP verification failed");
//   }
// }