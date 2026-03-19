import bcryptjs from "bcryptjs";

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function hash(password) {
  const rounds = getNumberOfRounds();
  const pepperedPassword = pepperPassword(password);
  return await bcryptjs.hash(pepperedPassword, rounds);
}

function pepperPassword(password) {
  const pepperedPassword = password + process.env.PEPPER_PASSWORD;
  return pepperedPassword;
}

async function compare(providedPassword, storedPassword) {
  const pepperedPassword = pepperPassword(providedPassword);
  return await bcryptjs.compare(pepperedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
