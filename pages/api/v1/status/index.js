import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();
  /*MINHA VERSÃO
  const version = await database.query("SELECT VERSION();");
  const versionFormated = version.rows[0].version;
  */
  const version = await database.query("SHOW server_version;");
  const versionFormated = version.rows[0].server_version;
  const databaseName = process.env.POSTGRES_DB;
  const activeConnections = await database.query({
    text: "select count(*) from pg_stat_activity where datname = $1",
    values: [databaseName],
  });
  const activeConnectionsFormated = parseInt(activeConnections.rows[0].count);
  const maxConnections = await database.query("SHOW max_connections");
  const maxConnectionsFormated = parseInt(
    maxConnections.rows[0].max_connections,
  );

  response.status(200).json({
    updated_at: updatedAt,
    /*MINHA VERSÃO
    sql_version: versionFormated,
    */
    dependencies: {
      database: {
        version: versionFormated,
        max_connections: maxConnectionsFormated,
        active_connections: activeConnectionsFormated,
      },
    },
  });
}
