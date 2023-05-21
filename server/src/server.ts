import fastify from "fastify";
import { memoriesRoutes } from "./routes/memories";
import fastifyCors from "@fastify/cors";

import 'dotenv/config'
import { authRoutes } from "./routes/auth";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { uploadRoutes } from "./routes/upload";
import { resolve } from "path";


const app = fastify()
app.register(fastifyCors, {
    origin: true,
})

app.register(require("@fastify/static"), {
    root : resolve(__dirname, "../uploads"), prefix : "/uploads"
})
app.register(multipart)
app.register(memoriesRoutes)
app.register(authRoutes)
app.register(jwt, {
    secret : "faustãonosbt",
})
app.register(uploadRoutes)


app.listen({ port: 3333 }).then(() => { console.log("Up !!!") })