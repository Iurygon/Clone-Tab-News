import orchestrator from "tests/orchestrator.js";
import { describe } from "node_modules/eslint/lib/rule-tester/rule-tester";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET  /api/v1/user", () => {
  test("With nonexistent session", async () => {
    const nonexistentToken =
      "0d747221d264f99182cfc721c00b9928d258f71d57f12bf2d242bd6e533788f0115f1c87734a4f745393ab7b952a135f";

    const response = await fetch("http://localhost:3000/api/v1/sessions", {
      method: "DELETE",
      headers: {
        cookie: `session_id=${nonexistentToken}`,
      },
    });

    expect(response.status).toBe(401);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "UnauthorizedError",
      message: "O usuário não possui sesão ativa.",
      action: "Verifique se o usuário está logado e tente novamente.",
      statusCode: 401,
    });
  });

  test("With expired session", async () => {
    jest.useFakeTimers({
      now: new Date() - session.EXPIRACION_IN_MILLISECONDS,
    });

    const createdUser = await orchestrator.createUser({
      username: "UserWithExpiredSession",
    });

    const sessionObject = await orchestrator.createSession(createdUser.id);

    jest.useRealTimers();

    const response = await fetch("http://localhost:3000/api/v1/sessions", {
      method: "DELETE",
      headers: {
        Cookie: `session_id=${sessionObject.token}`,
      },
    });

    expect(response.status).toBe(401);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "UnauthorizedError",
      message: "O usuário não possui sesão ativa.",
      action: "Verifique se o usuário está logado e tente novamente.",
      statusCode: 401,
    });
  });

  test("With valid session", async () => {
    const createdUser = await orchestrator.createUser({
      username: "UserWithValidSession",
    });

    const sessionObject = await orchestrator.createSession(createdUser.id);

    const response = await fetch("http://localhost:3000/api/v1/sessions", {
      method: "DELETE",
      headers: {
        Cookie: `session_id=${sessionObject.token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: sessionObject.id,
      token: sessionObject.token,
      user_id: sessionObject.user_id,
      created_at: responseBody.created_at,
      expires_at: responseBody.expires_at,
      updated_at: responseBody.updated_at,
    });

    expect(
      responseBody.expires_at < sessionObject.expires_at.toISOString(),
    ).toEqual(true);
    expect(
      responseBody.updated_at > sessionObject.updated_at.toISOString(),
    ).toEqual(true);

    //Set-cookies assertions
    const parsedSetCookie = setCookieParser(response, {
      map: true,
    });

    expect(parsedSetCookie.session_id).toEqual({
      name: "session_id",
      value: "invalid",
      maxAge: -1,
      path: "/",
      httpOnly: true,
    });

    //Double-check assertions

    const doubleCheckResponse = await fetch(
      "http://localhost:3000/api/v1/user",
      {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      },
    );

    expect(doubleCheckResponse.status).toBe(401);

    const doubleCheckResponseBody = await doubleCheckResponse.json();

    expect(doubleCheckResponseBody).toEqual({
      name: "UnauthorizedError",
      message: "O usuário não possui sesão ativa.",
      action: "Verifique se o usuário está logado e tente novamente.",
      statusCode: 401,
    });
  });
});
