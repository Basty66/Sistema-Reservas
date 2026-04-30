import { supabase } from './src/supabase.js'

async function run() {
  const { data, error } = await supabase.from('planes').insert([
    { 
      nombre: 'Plan Oasis Sunset', 
      precio_base: 150000, 
      descripcion: 'Arriendo desde las 16:00 hasta las 23:00 hrs. Disfruta de la piscina con luces y un atardecer inolvidable.', 
      items_incluidos: ['Piscina Iluminada', 'Quincho Completo', 'Música y Fogón', 'Terrazas'] 
    }
  ]);
  console.log(error || "Plan insertado con éxito!");
}
run();
