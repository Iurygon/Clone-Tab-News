import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 5000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      // const responseBody = await response.json();
      if (response.status != 200) {
        throw Error;
      }
    }
  }
}

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
