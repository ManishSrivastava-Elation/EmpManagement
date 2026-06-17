import axios from "axios";
import { baseUrl } from "./apis";

export const api = axios.create({
  baseURL: baseUrl,
});