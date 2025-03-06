import database from "infra/database";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("POST to api/v1/migrations should return 200", async () => {
  /*RODA OS MIGRATIONS, TRAZENDO COMO RESULTADO UMA LISTA COM OS MIGRATIONS RODADOS*/
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response1.status).toBe(201);
  const responseBody = await response1.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);

  /*COMO JÁ FOI RODADO ANTERIORMENTE, A VERIFICAÇÃO FEITA É SE O TAMANHO DO ARRAY RETORNADO É ZERO*/
  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response2.status).toBe(200);
  const responseBody2 = await response2.json();
  expect(Array.isArray(responseBody2)).toBe(true);
  expect(responseBody2.length).toBe(0);
});
