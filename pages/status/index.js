import useSWR from "swr";

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
    </>
  );
}

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (!isLoading && data) {
    const dadosStatus = { ...data.dependencies.database };
    console.log(dadosStatus);
    return (
      <div>
        Última atualização: {new Date(data.updated_at).toLocaleString("pt-BR")}{" "}
        <br />
        Versão do banco: {dadosStatus.version}
        <br />
        Conexões ativas: {dadosStatus.active_connections}
        <br />
        Máximo de conexões: {dadosStatus.max_connections}
        <br />
      </div>
    );
  } else {
    return <div>Carregando dados...</div>;
  }
}
