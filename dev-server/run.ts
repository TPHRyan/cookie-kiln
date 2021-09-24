import createServer from "./server";

const app = createServer();
app.listen(8777);
console.log("Server now running on port 8777.");

export default {};
