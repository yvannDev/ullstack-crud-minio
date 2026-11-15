import { app } from './app';
import { env } from './config/env';
import { initializeDatabase, pool } from './config/db';
import { ensureBucket } from './config/s3';

async function start() {
  try {
    await initializeDatabase();
    await ensureBucket();
    app.listen(env.PORT, () => {
      console.log(`API prête sur http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Impossible de démarrer le serveur :', error);
    await pool.end();
    process.exit(1);
  }
}

void start();
