import "./src/config/dotenv.js";
import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import { authMiddleware } from "./src/middlewares/authMiddleware.js";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);

app.post("/usuarios", authMiddleware, async (req, res) => {
  try {
    const novoUsuario = await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        age: Number(req.body.age),
      },
    });
    res.status(201).json({
      message: "Usuário criado com sucesso!",
      user: novoUsuario,
    });
  } catch (error) {
    console.error("Erro ao criar usuário", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.get("/usuarios", authMiddleware, async (req, res) => {
  try {
    const idade = Number(req.query.age) || undefined;
    let user = [];

    if (Object.keys(req.query).length > 0) {
      user = await prisma.user.findMany({
        where: {
          name: req.query.name,
          email: req.query.email,
          age: idade,
        },
      });
    } else {
      user = await prisma.user.findMany();
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao listar usuário(s)", error);
    res.status(500).json({ error: "Erro ao listar usuário(s)" });
  }
});

app.put("/usuarios/:id", authMiddleware, async (req, res) => {
  try {
    const editarUsuario = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        email: req.body.email,
        name: req.body.name,
        age: req.body.age,
      },
    });

    res.status(201).json({
      message: "Usuário editado com sucesso!",
      user: editarUsuario,
    });
  } catch (error) {
    console.log("Erro ao editar usuário", error);
    res.status(500).json({ error: "Erro ao editar usuário" });
  }
});

app.delete("/usuarios/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.log("Erro ao deletar usuário");
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
