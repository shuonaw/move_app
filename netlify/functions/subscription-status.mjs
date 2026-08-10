import { json, getUser } from './_shared.mjs';

export default async (req)=>{
  const url=new URL(req.url);
  const userId=url.searchParams.get('userId');
  if(!userId) return json({subscribed:false,error:'Missing userId'},400);
  const user=await getUser(userId);
  return json({subscribed:!!user?.subscription});
};
