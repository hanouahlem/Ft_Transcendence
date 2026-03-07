
import express from "express"
import prisma from "./prisma"

const app = express()

app.use(express.json())

app.post("/users", async (req, res) => {

  const { username, email, password } = req.body

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password
    }
  })

  res.json(user)
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})