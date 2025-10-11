import axios from "axios";

const url = "http://localhost:8080/v1";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  type: "stu" | "fac";
}

interface LoginUserData {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterUserData) => {
  try {
    const response = await axios.post(`${url}/auth/signup`, data, {
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
    const response = await axios.post(`${url}/auth/login`, data, {
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

export const refreshToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.post(
      `${url}/auth/refresh`,
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const createProject = async (data: any, token: string) => {
  try {
    const response = await axios.post(`${url}/projects`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const fetchProjects_active = async (token: string) => {
  try {
    const response = await axios.get(`${url}/projects`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
