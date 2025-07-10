import axios from "axios";

const url = "http://localhost:8000";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "prof";
}

interface LoginUserData {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterUserData) => {
  try {
    const response = await axios.post(`${url}/register_user`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (data: LoginUserData) => {
  try {
    const response = await axios.post(`${url}/login`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data.token; // Assuming the response contains a token
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};
