import app from './app.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App is listening on port 127.0.0.1:${PORT}`);
});
