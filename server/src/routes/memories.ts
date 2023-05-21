import { FastifyInstance } from "fastify";
import { prisma } from "../libs/prisma";
import { z } from 'zod'
import { REPL_MODE_SLOPPY } from "repl";


export async function memoriesRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (request) => {
        await request.jwtVerify()
    })

    app.get("/memories", async (request) => {

        const memories = await prisma.memory.findMany({
            orderBy: {
                createdAt: 'asc',
            }
        })
        return memories.map((memory: any) => {
            return {
                id: memory.id,
                coverUrl: memory.coverUrl,
                excerpt: memory.content.substring(0, 155).concat("..."),
                createdAt: memory.createdAt
            }
        })
    })

    app.get("/memories/:id", async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id, } = paramsSchema.parse(request.params)


        const memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id: id
            }
        })

        if (!memory.isPublic && memory.id !== request.user.sub) {
            return reply.status(401)
        }

        return memory
    })

    app.post("/memories", async (request, reply) => {
    
       
        const bodySchema = z.object({
            content: z.string(),
            coverUrl: z.string(),
            isPublic: z.coerce.boolean().default(false),
        })

        const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
        
        const memory = await prisma.memory.create({
            data: {
                content,
                coverUrl,
                isPublic,
                userId: request.user.sub
            }
        })

        if (!memory.isPublic && memory.id !== request.user.sub) {
            return reply.status(401)
        }

        return memory
    })

    app.put("/memories/:id", async (request, reply) => {

        const paramsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = paramsSchema.parse(request.params)

        const bodySchema = z.object({
            content: z.string(),
            coverUrl: z.string(),
            isPublic: z.coerce.boolean().default(false),
        })

        const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

        let memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id: id
            }
        })

        if (!memory.isPublic && memory.id !== request.user.sub) {
            return reply.status(401)
        }

        memory = await prisma.memory.update({
            where: {
                id,
            },
            data: {
                content,
                coverUrl,
                isPublic,
                userId: ''
            }
        })

        return memory
    })


}