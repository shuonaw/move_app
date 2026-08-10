import webpush from 'web-push';
import { store, getUser, putUser } from './_shared.mjs';

const WINDOWS=[
  {id:'afternoon',start:12.5,end:15.5,label:'afternoon'},
  {id:'evening',start:18.5,end:21.5,label:'evening'}
];

function localParts(timeZone){
  const parts=new Intl.DateTimeFormat('en-US',{
    timeZone,year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hourCycle:'h23'
  }).formatToParts(new Date());
  const m=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return {date:`${m.year}-${m.month}-${m.day}`,hour:Number(m.hour)+Number(m.minute)/60};
}

function hash(s){
  let h=2166136261;
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
  return Math.abs(h>>>0);
}

function chosenSlot(userId,date,w){
  // 30-minute slots, stable per user/day/window, so prompts vary across days.
  const slots=Math.floor((w.end-w.start)*2)+1;
  return w.start+(hash(`${userId}:${date}:${w.id}`)%slots)/2;
}

export default async ()=>{
  const pub=Netlify.env.get('VAPID_PUBLIC_KEY');
  const priv=Netlify.env.get('VAPID_PRIVATE_KEY');
  const subject=Netlify.env.get('VAPID_SUBJECT')||'mailto:hello@example.com';
  if(!pub || !priv) return new Response('Missing VAPID keys',{status:500});

  webpush.setVapidDetails(subject,pub,priv);
  const s=store();
  const ids=(await s.get('user-index',{type:'json'}))||[];
  const now=Date.now();

  for(const id of ids){
    const user=await getUser(id);
    if(!user?.subscription || !user?.timeZone) continue;

    const {date,hour}=localParts(user.timeZone);
    const w=WINDOWS.find(x=>hour>=x.start && hour<=x.end);
    if(!w) continue;

    // Pick one semi-random half-hour slot in the window.
    const slot=chosenSlot(id,date,w);
    if(hour < slot || hour >= slot+0.55) continue;

    if(user.lastPromptDate===date && user.lastPromptWindow===w.id) continue;
    if(user.lastLogAt && now-new Date(user.lastLogAt).getTime() < 2*60*60*1000) continue;

    const payload=JSON.stringify({
      title:'Move',
      body:`A gentle ${w.label} check-in: what are you noticing right now?`,
      url:'/?checkin=1',
      tag:`move-${date}-${w.id}`
    });

    try{
      await webpush.sendNotification(user.subscription,payload);
      user.lastPromptDate=date;
      user.lastPromptWindow=w.id;
      user.updatedAt=new Date().toISOString();
      await putUser(id,user);
    }catch(err){
      console.error('Push failed',id,err?.statusCode||err);
      if(err?.statusCode===404 || err?.statusCode===410){
        user.subscription=null;
        await putUser(id,user);
      }
    }
  }
  return new Response('ok');
};

export const config={schedule:'*/30 * * * *'};
