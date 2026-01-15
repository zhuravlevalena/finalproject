const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Сервак запущен на порту ${PORT}`);
  }
});