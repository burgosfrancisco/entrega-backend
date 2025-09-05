import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log('✅ Mongo conectado a Atlas');
  } catch (err) {
    console.error('❌ Error al conectar a Mongo:', err);
    process.exit(1);
  }
}
