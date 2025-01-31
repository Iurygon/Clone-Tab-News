function status(request, response) {
  response.status(200).json({ chave: "Teste da API" });
}

export default status;
