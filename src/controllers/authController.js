import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";

const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

export async function registro(req, res) {
  const { name, email, age, password } = req.body;

  try {
    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist)
      return res.status(400).json({ error: "E-mail já cadastrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        age,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Senha inválida" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login bem-sucedido", token });
  } catch (err) {
    res.status(500).json({ error: "Erro no login" });
  }
}
