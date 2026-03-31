import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const LEGACY_OWNER = 'legacy_migration';

const noteSchema = new mongoose.Schema({ ownerId: String }, { strict: false });
const boxSchema = new mongoose.Schema({ ownerId: String }, { strict: false });
const Note = mongoose.model('Note', noteSchema);
const Box = mongoose.model('Box', boxSchema);

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado ao MongoDB.');

  const noteResult = await Note.updateMany(
    { ownerId: { $exists: false } },
    { $set: { ownerId: LEGACY_OWNER } }
  );

  const boxResult = await Box.updateMany(
    { ownerId: { $exists: false } },
    { $set: { ownerId: LEGACY_OWNER } }
  );

  console.log(`Notes migradas: ${noteResult.modifiedCount}`);
  console.log(`Boxes migradas: ${boxResult.modifiedCount}`);
  console.log('Migração concluída. Dados antigos marcados como "legacy_migration".');
  console.log('Esses dados existem no banco mas não serão visíveis em nenhum dispositivo novo — correto.');

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
