import { json } from './_shared.mjs';

export default async ()=>{
  const publicKey=Netlify.env.get('VAPID_PUBLIC_KEY');
  if(!publicKey) return json({error:'VAPID_PUBLIC_KEY is not configured'},500);
  return json({publicKey});
};
