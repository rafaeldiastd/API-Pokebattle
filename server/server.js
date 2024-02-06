const express = require("express");
const app = express();
const port = 3000;
const uuid = require("uuid");
const axios = require("axios");
const cors = require("cors");

app.use(express.json());
app.use(cors());

const usuarios = [];
let currentPokemonSpawn = null;

function generateId() {
  return uuid.v4();
}

function fetchPokemonData() {
  const spawnId = Math.floor(Math.random() * (501 - 1) + 1);

  axios
    .get(`https://pokeapi.co/api/v2/pokemon/` + spawnId)
    .then((response) => {
      currentPokemonSpawn = response.data;
      console.log(``);
      console.log(`Pokémon appears: \u001B[31m${JSON.stringify(currentPokemonSpawn.name)}\u001B[0m ID:\u001B[31m ${JSON.stringify(currentPokemonSpawn.id)} \u001B[0m`);
    })
    .catch((error) => {
      console.error("Erro ao obter o pokemon", error);
    });
}

fetchPokemonData();
setInterval(fetchPokemonData, 100000);

app.get("/", (req, res) => {


});

// Endpoint para criar um novo usuário
app.post("/usuario/criar", (req, res) => {
  const { nome, email, senha, pokebolas, favoritos, capturados } = req.body;

  const idNovo = generateId();
  const novoUsuario = {
    id: idNovo,
    nome,
    email,
    senha,
    pokebolas: [
      {
        pokeball: "",
        masterball: "",
      },
    ],
    favoritos: [],
    capturados: [],
  };

  const validacao = usuarios.find((usuarios) => usuarios.email === email);
  if (validacao) {
    return res.status(400).json({ message: "O e-mail já está cadastrado." });
  }

  usuarios.push(novoUsuario);
  res.status(201).json({ message: "Criado com sucesso" });
});

// Endpoint para exibir todos os usuários
app.get("/usuario/exibir", (req, res) => {
  res.json(usuarios);
});

// Endpoint para pesquisar por email
app.get("/usuario/exibir/:id", (req, res) => {
  const { id } = req.params;
  const userIndex = usuarios.findIndex((usuario) => usuario.id === id);
  if (userIndex !== -1) {
    res.json(usuarios[userIndex]);
  } else {
    res.status(404).json({ message: "Não foi encontrado" });
  }
});

// Endpoint para atualizar um usuário pelo email
app.patch("/usuario/atualizar/:id", (req, res) => {
  const userId = req.params.id;
  const { nome, senha, email, pokebolas, favoritos, capturados } = req.body;

  const usuarioIndex = usuarios.findIndex(
    (usuario) => usuario.id === userId
  );

  if (usuarioIndex !== -1) {
    // Atualizar apenas os campos fornecidos no corpo da requisição
    if (nome) usuarios[usuarioIndex].nome = nome;
    if (senha) usuarios[usuarioIndex].senha = senha;
    if (email) usuarios[usuarioIndex].email = email;
    if (pokebolas) usuarios[usuarioIndex].pokebolas = pokebolas;
    if (favoritos) usuarios[usuarioIndex].favoritos = favoritos;
    if (capturados) usuarios[usuarioIndex].capturados = capturados;

    res.json(usuarios[usuarioIndex]);
  } else {
    res.status(404).json({ message: "Usuário não encontrado" });
  }
});

app.get("/spawn", (req, res) => {
  res.json(currentPokemonSpawn);
});

app.post("/usuario/capturar/:idUsuario", (req, res) => {
  const userId = req.params.idUsuario;
  const { id, nome, hp, attack, defense, types } = req.body;

  const usuario = usuarios.find((usuario) => usuario.id === userId);
  if (!usuario) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }
  usuario.capturados.push({
    id,
    nome,
    hp,
    attack,
    defense,
    types
  });
  res.json({ message: "Pokémon capturado com sucesso!" });
});


app.post("/usuario/favoritar/:idUsuario", (req, res) => {
  const userId = req.params.idUsuario;
  const { id, name } = req.body;

  const usuario = usuarios.find((usuario) => usuario.id === userId);
  if (!usuario) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }
  usuario.favoritos.push({
    id,
    name
  });
  res.json({ message: "Pokémon favoritado com sucesso!" });
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});


