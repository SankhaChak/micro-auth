import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const privateKey = fs.readFileSync("./certs/private.pem");
const jwk = rsaPemToJwk(
  privateKey,
  {
    use: "sig"
  },
  "public"
);
// eslint-disable-next-line no-undef
console.log("🚀 ~ file: convertPemToJwk.mjs:5 ~ privateKey:", jwk);
